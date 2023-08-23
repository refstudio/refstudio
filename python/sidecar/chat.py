import os

import openai
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_fixed

from sidecar import prompts, settings, typing
from sidecar.ranker import BM25Ranker
from sidecar.settings import logger
from sidecar.storage import JsonStorage
from sidecar.typing import ChatRequest, ChatResponse, ChatResponseChoice

load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")


def ask_question(request: ChatRequest):
    input_text = request.text
    n_choices = request.n_choices
    temperature = request.temperature

    logger.info(f"Calling chat with the following parameters: {request.dict()}")

    storage = JsonStorage(filepath=settings.REFERENCES_JSON_PATH)
    logger.info(f"Loading documents from storage: {storage.filepath}")
    storage.load()
    logger.info(f"Loaded {len(storage.chunks)} documents from storage")

    ranker = BM25Ranker(storage=storage)
    chat = Chat(input_text=input_text, storage=storage, ranker=ranker)

    try:
        choices = chat.ask_question(n_choices=n_choices, temperature=temperature)
    except Exception as e:
        logger.error(e)
        response = ChatResponse(
            status=typing.ResponseStatus.ERROR,
            message=str(e),
            choices=[],
        )
        return response

    logger.info(f"Returning {len(choices)} chat response choices to client: {choices}")
    response = ChatResponse(
        status=typing.ResponseStatus.OK,
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
    ):
        self.input_text = input_text
        self.ranker = ranker
        self.storage = storage

    def get_relevant_documents(self):
        docs = self.ranker.get_top_n(query=self.input_text, limit=5)
        return docs

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
    def call_model(self, messages: list, n_choices: int = 1, temperature: float = 0.7):
        logger.info(f"Calling OpenAI chat API with the following input message(s): {messages}")
        response = openai.ChatCompletion.create(
            model=os.environ["OPENAI_CHAT_MODEL"],
            messages=messages,
            n=n_choices,  # number of completions to generate
            temperature=temperature,  # 0 = no randomness, deterministic
            # max_tokens=200,
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
            ChatResponseChoice(index=choice['index'], text=choice["message"]["content"])
            for choice in response['choices']
        ]

    def ask_question(self, n_choices: int = 1, temperature: float = 0.7) -> dict:
        logger.info("Fetching 5 most relevant document chunks from storage")
        docs = self.get_relevant_documents()
        logger.info("Creating input prompt for chat API")
        context_str = prompts.prepare_chunks_for_prompt(chunks=docs)
        prompt = prompts.create_prompt_for_chat(query=self.input_text, context=context_str)
        messages = self.prepare_messages_for_chat(text=prompt)
        response = self.call_model(messages=messages, n_choices=n_choices, temperature=temperature)
        choices = self.prepare_choices_for_client(response=response)
        return choices
