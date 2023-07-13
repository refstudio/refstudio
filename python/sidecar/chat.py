import json
import os
import sys

import openai
from dotenv import load_dotenv
from sidecar import prompts, settings
from sidecar.ranker import BM25Ranker
from sidecar.settings import logger
from sidecar.storage import JsonStorage
from sidecar.typing import ChatRequest, ChatResponseChoice

load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")


def ask_question(request: ChatRequest):
    input_text = request.text
    n_choices = request.n_choices
    logger.info(f"Calling chat with the following parameters: {request.dict()}")

    storage = JsonStorage(filepath=settings.REFERENCES_JSON_PATH)
    logger.info(f"Loading documents from storage: {storage.filepath}")
    storage.load()
    logger.info(f"Loaded {len(storage.documents)} documents from storage.")

    ranker = BM25Ranker(storage=storage)
    chat = Chat(input_text=input_text, storage=storage, ranker=ranker)
    choices = chat.ask_question(n_choices=n_choices)
    logger.info(f"Returning {len(choices)} chat response choices to client: {choices}")
    sys.stdout.write(json.dumps([c.dict() for c in choices]))


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

    def call_model(self, messages: list, n_choices: int = 1):
        logger.info(f"Calling OpenAI chat API with the following input message(s): {messages}")
        response = openai.ChatCompletion.create(
            model=os.environ["OPENAI_CHAT_MODEL"],
            messages=messages,
            n=n_choices,  # number of completions to generate
            temperature=0,  # 0 = no randomness, deterministic
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

    def ask_question(self, n_choices: int = 1) -> dict:
        logger.info("Fetching five most relevant document chunks from storage")
        docs = self.get_relevant_documents()
        logger.info("Creating input prompt for chat API")
        context_str = prompts.prepare_chunks_for_prompt(chunks=docs)
        prompt = prompts.create_prompt_for_chat(query=self.input_text, context=context_str)
        messages = self.prepare_messages_for_chat(text=prompt)
        response = self.call_model(messages=messages, n_choices=n_choices)
        choices = self.prepare_choices_for_client(response=response)
        return choices
