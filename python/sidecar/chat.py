import json
import os
import sys
from pathlib import Path

import openai
from dotenv import load_dotenv
from sidecar import prompts
from sidecar.ranker import BM25Ranker
from sidecar.storage import JsonStorage
from sidecar.typing import ChatRequest, ChatResponseChoice

load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")

# TODO - move this into settings or env vars
REFERENCES_STORAGE_PATH = Path(
    "~/Library/Application Support/com.tauri.dev/project-x/.storage/references.json"
).expanduser()


# TODO - remove storage_path from this function
# it's only here to make testing easier for right now
def ask_question(request: ChatRequest, storage_path: str = REFERENCES_STORAGE_PATH):
    input_text = request.text
    n_options = 1
    storage = JsonStorage(filepath=storage_path)
    storage.load()
    ranker = BM25Ranker(storage=storage)
    chat = Chat(input_text=input_text, storage=storage, ranker=ranker)
    choices = chat.ask_question(n_options=n_options)
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

    def call_model(self, messages: list, n_options: int = 1):
        response = openai.ChatCompletion.create(
            model=os.environ["OPENAI_CHAT_MODEL"],
            messages=messages,
            n=n_options,  # number of completions to generate
            temperature=0,  # 0 = no randomness, deterministic
            # max_tokens=200,
        )
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

    def ask_question(self, n_options: int = 1) -> dict:
        docs = self.get_relevant_documents()
        prompt = prompts.create_prompt_for_chat(query=self.input_text, context=docs)
        messages = self.prepare_messages_for_chat(text=prompt)
        response = self.call_model(messages=messages, n_options=n_options)
        choices = self.prepare_choices_for_client(response=response)
        return choices
