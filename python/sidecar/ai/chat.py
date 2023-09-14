import os

import litellm
import openai
from sidecar.ai.prompts import create_prompt_for_chat, prepare_chunks_for_prompt
from sidecar.ai.ranker import BM25Ranker
from sidecar.ai.schemas import ChatRequest, ChatResponse, ChatResponseChoice
from sidecar.config import logger
from sidecar.references.storage import JsonStorage, get_references_json_storage
from sidecar.settings.schemas import FlatSettingsSchema, ModelProvider
from sidecar.typing import ResponseStatus
from tenacity import retry, stop_after_attempt, wait_fixed


def yield_response(
    request: ChatRequest,
    project_id: str = None,
    user_settings: FlatSettingsSchema = None,
):
    input_text = request.text
    temperature = request.temperature
    stream = request.stream

    if user_settings is None:
        # this is for local dev environment
        openai.api_key = os.environ.get("API_KEY")
        model = "gpt-3.5-turbo"
    elif user_settings.model_provider == ModelProvider.OPENAI:
        openai.api_key = user_settings.api_key
        model = user_settings.model
    elif user_settings.model_provider == ModelProvider.OLLAMA:
        model = "llama2"

    logger.info(f"Calling chat with the following parameters: {request.dict()}")

    storage = get_references_json_storage(user_id="user1", project_id=project_id)

    logger.info(f"Loaded {len(storage.chunks)} documents from storage")

    ranker = BM25Ranker(storage=storage)
    chat = Chat(input_text=input_text, storage=storage, ranker=ranker, model=model)
    return chat.stream_response(temperature=temperature, stream=stream)


def ask_question(
    request: ChatRequest,
    project_id: str = None,
    user_settings: FlatSettingsSchema = None,
) -> ChatResponse:
    input_text = request.text
    n_choices = request.n_choices
    temperature = request.temperature
    stream = request.stream

    if user_settings is None:
        # this is for local dev environment
        openai.api_key = os.environ.get("API_KEY")
        model = "gpt-3.5-turbo"
    elif user_settings.model_provider == ModelProvider.OPENAI:
        openai.api_key = user_settings.api_key
        model = user_settings.model
    elif user_settings.model_provider == ModelProvider.OLLAMA:
        model = "llama2"

    logger.info(f"Calling chat with the following parameters: {request.dict()}")

    storage = get_references_json_storage(user_id="user1", project_id=project_id)

    logger.info(f"Loaded {len(storage.chunks)} documents from storage")

    ranker = BM25Ranker(storage=storage)
    chat = Chat(input_text=input_text, storage=storage, ranker=ranker, model=model)

    try:
        choices = chat.ask_question(
            n_choices=n_choices, temperature=temperature, stream=stream
        )
    except Exception as e:
        logger.error(e)
        response = ChatResponse(
            status=ResponseStatus.ERROR,
            message=str(e),
            choices=[],
        )
        return response

    logger.info(f"Returning {len(choices)} chat response choices to client: {choices}")
    response = ChatResponse(
        status=ResponseStatus.OK,
        message="",
        choices=[r.dict() for r in choices],
    )
    return response


class Chat:
    def __init__(
        self,
        input_text: str,
        storage: JsonStorage,
        ranker: BM25Ranker,
        model: str = "gpt-3.5-turbo",
    ):
        self.input_text = input_text
        self.ranker = ranker
        self.storage = storage
        self.model = model

    def get_relevant_documents(self):
        docs = self.ranker.get_top_n(query=self.input_text, limit=5)
        return docs

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1), reraise=True)
    def call_model(
        self,
        messages: list,
        n_choices: int = 1,
        temperature: float = 0.7,
        stream: bool = False,
    ):
        logger.info(
            f"Calling OpenAI chat API with the following input message(s): {messages}"
        )
        response = litellm.completion(
            model=self.model,
            messages=messages,
            n=n_choices,  # number of completions to generate
            temperature=temperature,  # 0 = no randomness, deterministic
            # max_tokens=200,
            stream=stream,
        )
        logger.info(f"Received response from OpenAI chat API: {response}")
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

    def ask_question(
        self, n_choices: int = 1, temperature: float = 0.7, stream: bool = False
    ) -> dict:
        logger.info("Fetching 5 most relevant document chunks from storage")
        docs = self.get_relevant_documents()
        logger.info("Creating input prompt for chat API")
        context_str = prepare_chunks_for_prompt(chunks=docs)
        prompt = create_prompt_for_chat(query=self.input_text, context=context_str)
        messages = self.prepare_messages_for_chat(text=prompt)
        response = self.call_model(
            messages=messages,
            n_choices=n_choices,
            temperature=temperature,
            stream=stream,
        )

        if stream:
            # no need to wrap in a ChatResponse object
            return response

        choices = self.prepare_choices_for_client(response=response)
        return choices

    def yield_response(self, temperature: float = 0.7, stream: bool = False):
        response = self.ask_question(
            n_choices=1, temperature=temperature, stream=stream
        )
        for chunk in response:
            yield chunk["choices"][0]["delta"]["content"]
