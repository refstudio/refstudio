import json
import os
import sys

import openai
from dotenv import load_dotenv
from sidecar import prompts, shared
from sidecar.typing import (RewriteChoice, RewriteRequest,
                            TextCompletionChoice, TextCompletionRequest,
                            TextSuggestionChoice)

load_dotenv()
openai.api_key = os.environ.get("OPENAI_API_KEY")


def rewrite(arg: RewriteRequest):
    text = arg.text
    manner = arg.manner
    n_choices = arg.n_choices
    temperature = arg.temperature

    # there are 1.33 tokens per word on average
    # seems reasonable to require a max_tokens roughly equivalent to our input text
    # https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them
    max_tokens = int(round(len(text.split(" ")) * 1.33))

    prompt = prompts.create_prompt_for_rewrite(text, manner)
    chat = Rewriter(prompt, n_choices, temperature, max_tokens)
    response = chat.get_response(response_type=RewriteChoice)
    sys.stdout.write(json.dumps([r.dict() for r in response]))


def complete_text(request: TextCompletionRequest):
    prompt = prompts.create_prompt_for_text_completion(request)
    chat = Rewriter(
        prompt,
        n_choices=request.n_choices,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
    )
    choices = chat.get_response(response_type=TextCompletionChoice)
    choices = shared.trim_completion_prefix_from_choices(prefix=request.text, choices=choices)
    sys.stdout.write(json.dumps([r.dict() for r in choices]))


class Rewriter:
    """
    Rewrite or complete text using the OpenAI chat API.

    Parameters
    ----------
    prompt : str
        The prompt to send to the OpenAI chat API.
    n_choices : int
        The number of choices to return from the OpenAI chat API.
    temperature : float, optional, default=0.7
        The temperature to use when generating text from the OpenAI chat API.
    max_tokens : int, optional, default=512
        The maximum number of tokens to generate from the OpenAI chat API.
    """
    def __init__(
            self,
            prompt: str,
            n_choices: int = 1,
            temperature: float = 0.7,
            max_tokens: int = 512
        ):
        self.prompt = prompt
        self.n_choices = int(n_choices)
        self.temperature = temperature
        self.max_tokens = max_tokens

    def get_response(self, response_type: TextSuggestionChoice):
        messages = self.prepare_messages_for_chat(self.prompt)
        response = self.call_model(messages)
        response = self.prepare_choices_for_client(response, response_type=response_type)
        return response

    def prepare_choices_for_client(
            self,
            response: dict,
            response_type: TextSuggestionChoice
        ) -> list[TextSuggestionChoice]:
        return [
            response_type(index=choice['index'], text=choice["message"]["content"].strip())
            for choice in response['choices']
        ]

    def call_model(self, messages: list):
        response = openai.ChatCompletion.create(
            model=os.environ["OPENAI_CHAT_MODEL"],
            messages=messages,
            n=self.n_choices,  # number of completions to generate
            temperature=self.temperature,
            # maximum number of tokens to generate (1 word ~= 1.33 tokens)
            max_tokens=self.max_tokens,
        )
        return response

    def prepare_messages_for_chat(self, text: str) -> list:
        messages = [
            {"role": "user", "content": text},
        ]
        return messages
