import os
from typing import AsyncGenerator

import litellm
import openai
from openai.error import AuthenticationError
from requests.exceptions import ConnectionError
from sidecar.ai.prompts import create_prompt_for_chat, prepare_chunks_for_prompt
from sidecar.ai.ranker import BM25Ranker
from sidecar.ai.schemas import ChatRequest, ChatResponse, ChatResponseChoice
from sidecar.config import logger
from sidecar.references.storage import JsonStorage, get_references_json_storage
from sidecar.settings.schemas import FlatSettingsSchema, ModelProvider
from sidecar.typing import ResponseStatus
from tenacity import retry, stop_after_attempt, wait_fixed


def get_missing_references_message() -> str:
    return (
        "It looks like reference PDFs have not been ingested yet. "
        "Chat allows you to interact with your reference PDFs, "
        "so please add some references and try again."
    )


def get_missing_api_key_error_message() -> str:
    return (
        "It looks like you forgot to provide an API key. "
        "Please add one in the settings menu by clicking the gear icon in the "
        "lower left corner of the screen."
    )


def get_invalid_api_key_error_message() -> str:
    return (
        "I'm having an issue authenticating with your API key. "
        "Please double check that it is correct in the settings menu."
    )


def get_ollama_connection_error_message() -> str:
    return (
        "It looks like you forgot to start Ollama. "
        "Please start Ollama on your local machine and try again."
    )


def get_unhandled_error_message() -> str:
    return "Something went wrong. Please try again."


async def yield_error_message(msg_func: callable) -> AsyncGenerator:
    yield f"data: {msg_func()}\n\n"


async def stream_response(response):
    # try/except for ConnectionError needs to happen here rather than in yield_response
    # because of where the exception is raised within litellm (in the async generator)
    try:
        async for chunk in response:
            item = chunk["choices"][0]["delta"].get("content", "")
            yield f"data: {item}\n\n"
    except ConnectionError as e:
        logger.error(e)
        yield f"data: {get_ollama_connection_error_message()}\n\n"


def create_chat_response(
    status: ResponseStatus, message: str, choices: list[ChatResponseChoice]
) -> ChatResponse:
    return ChatResponse(status=status, message=message, choices=choices)


async def yield_response(
    request: ChatRequest,
    project_id: str = None,
    user_settings: FlatSettingsSchema = None,
) -> AsyncGenerator:
    """
    This is a generator function that yields responses from the chat API.
    Only used for streaming responses to the client.
    """
    input_text = request.text
    temperature = request.temperature

    if user_settings.model_provider == ModelProvider.OPENAI:
        openai.api_key = user_settings.api_key

    logger.info(f"Calling chat with the following parameters: {request.dict()}")

    storage = get_references_json_storage(user_id="user1", project_id=project_id)
    logger.info(f"Loaded {len(storage.chunks)} documents from storage")

    if not storage.chunks:
        # no reference chunks available for chat
        return yield_error_message(get_missing_references_message)

    if user_settings.model_provider == ModelProvider.OPENAI and not openai.api_key:
        return yield_error_message(get_missing_api_key_error_message)

    ranker = BM25Ranker(storage=storage)
    chat = Chat(
        input_text=input_text,
        storage=storage,
        ranker=ranker,
        model_provider=user_settings.model_provider,
        model=user_settings.model,
    )

    try:
        response = await chat.ask_question(
            n_choices=1, temperature=temperature, stream=True
        )
    except AuthenticationError as e:
        logger.error(e)
        return yield_error_message(get_invalid_api_key_error_message)
    except ConnectionError as e:
        logger.error(e)
        return yield_error_message(get_ollama_connection_error_message)
    except Exception as e:
        logger.error(e)
        return yield_error_message(get_unhandled_error_message)

    return stream_response(response)


async def ask_question(
    request: ChatRequest,
    project_id: str = None,
    user_settings: FlatSettingsSchema = None,
) -> ChatResponse:
    input_text = request.text
    n_choices = request.n_choices
    temperature = request.temperature

    if user_settings.model_provider == ModelProvider.OPENAI:
        openai.api_key = user_settings.api_key

    logger.info(f"Calling chat with the following parameters: {request.dict()}")

    storage = get_references_json_storage(user_id="user1", project_id=project_id)
    logger.info(f"Loaded {len(storage.chunks)} documents from storage")

    # no reference chunks available for chatQ
    if not storage.chunks:
        response = create_chat_response(
            status=ResponseStatus.ERROR,
            message=get_missing_references_message(),
            choices=[],
        )
        return response

    # no API key provided
    if user_settings.model_provider == ModelProvider.OPENAI and not openai.api_key:
        response = create_chat_response(
            status=ResponseStatus.ERROR,
            message=get_missing_api_key_error_message(),
            choices=[],
        )
        return response

    ranker = BM25Ranker(storage=storage)
    chat = Chat(
        input_text=input_text,
        storage=storage,
        ranker=ranker,
        model_provider=user_settings.model_provider,
        model=user_settings.model,
    )

    try:
        choices = await chat.ask_question(n_choices=n_choices, temperature=temperature)
    except AuthenticationError as e:
        logger.error(e)
        response = create_chat_response(
            status=ResponseStatus.ERROR,
            message=get_invalid_api_key_error_message(),
            choices=[],
        )
        return response
    except ConnectionError as e:
        logger.error(e)
        response = create_chat_response(
            status=ResponseStatus.ERROR,
            message=get_ollama_connection_error_message(),
            choices=[],
        )
        return response
    except Exception as e:
        logger.error(e)
        response = create_chat_response(
            status=ResponseStatus.ERROR,
            message=get_unhandled_error_message(),
            choices=[],
        )
        return response

    logger.info(f"Returning {len(choices)} chat response choices to client: {choices}")

    return create_chat_response(
        status=ResponseStatus.OK,
        message="",
        choices=[r.dict() for r in choices],
    )


class Chat:
    def __init__(
        self,
        input_text: str,
        storage: JsonStorage,
        ranker: BM25Ranker,
        model_provider: ModelProvider = ModelProvider.OPENAI,
        model: str = "gpt-3.5-turbo",
    ):
        self.input_text = input_text
        self.ranker = ranker
        self.storage = storage
        self.model_provider = model_provider
        self.model = model

    def get_relevant_documents(self):
        docs = self.ranker.get_top_n(query=self.input_text, limit=5)
        return docs

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1), reraise=True)
    async def call_model(
        self,
        messages: list,
        n_choices: int = 1,
        temperature: float = 0.7,
        stream: bool = False,
    ):
        logger.info(
            f"Calling {self.model} chat with the following input message(s): {messages}"
        )

        params = {
            "model": self.model,
            "messages": messages,
            "n": n_choices,  # number of completions to generate
            "temperature": temperature,  # 0 = no randomness, deterministic
            "stream": stream,
        }

        if self.model_provider == ModelProvider.OLLAMA:
            params["api_base"] = "http://localhost:11434"
            params["custom_llm_provider"] = "ollama"

        response = await litellm.acompletion(**params)
        logger.info(f"Received response from chat API: {response}")
        return response

    def prepare_messages_for_chat(self, text: str) -> list:
        messages = [
            {"role": "user", "content": text},
        ]
        return messages

    def prepare_choices_for_client(self, response: dict) -> list[ChatResponseChoice]:
        return [
            ChatResponseChoice(index=choice["index"], text=choice["message"]["content"])
            for choice in response["choices"]
        ]

    async def ask_question(
        self, n_choices: int = 1, temperature: float = 0.7, stream: bool = False
    ) -> dict:
        logger.info("Fetching 5 most relevant document chunks from storage")

        docs = self.get_relevant_documents()

        logger.info("Creating input prompt for chat API")

        context_str = prepare_chunks_for_prompt(chunks=docs)
        prompt = create_prompt_for_chat(query=self.input_text, context=context_str)
        messages = self.prepare_messages_for_chat(text=prompt)

        response = await self.call_model(
            messages=messages,
            n_choices=n_choices,
            temperature=temperature,
            stream=stream,
        )

        if stream:
            return response

        if self.model_provider == ModelProvider.OLLAMA:
            # need to unwrap response for Ollama
            response = await self.unwrap_response(response)

        choices = self.prepare_choices_for_client(response=response)
        return choices

    async def unwrap_response(self, generator):
        response = ""
        async for elem in generator:
            response += elem["choices"][0]["delta"]["content"]
        return {"choices": [{"index": 0, "message": {"content": response}}]}
