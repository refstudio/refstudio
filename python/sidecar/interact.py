import json
import os
import sys

import openai
from dotenv import load_dotenv
from sidecar import prompts

load_dotenv()
openai.api_key = os.environ["OPENAI_API_KEY"]


def summarize(text: str, n_options: int = 1) -> str:
    prompt = prompts.create_prompt_for_summarize(text)
    chat = Chat(prompt, n_options)
    response = chat.get_response()
    sys.stdout.write(json.dumps(response))


class Chat:
    def __init__(self, text: str, n_options: int = 1):
        self.text = text
        self.n_options = int(n_options)

    def get_response(self):
        messages = self.prepare_messages_for_chat(self.text)
        response = self.call_model(messages)
        response = self.prepare_choices_for_client(response)
        return response
    
    def prepare_choices_for_client(self, response: dict) -> list:
        choices = []
        for choice in response["choices"]:
            choices.append(
                {'index': choice["index"], 'text': choice["message"]["content"]}
            )
        return choices
    
    def call_model(self, messages: list):
        response = openai.ChatCompletion.create(
            model=os.environ["OPENAI_CHAT_MODEL"],
            messages=messages,
            n=1,  # number of completions to generate
            temperature=0,  # 0 = no randomness, deterministic
            max_tokens=200,
        )
        return response

    def prepare_messages_for_chat(self, text: str) -> list:
        messages = [
            {"role": "user", "content": text},
        ]
        return messages
