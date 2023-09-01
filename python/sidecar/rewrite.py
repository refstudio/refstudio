import os

import openai
from sidecar import prompts, shared, typing
from sidecar.settings import logger
from sidecar.typing import (
    RewriteChoice,
    RewriteRequest,
    TextCompletionChoice,
    TextCompletionRequest,
    TextSuggestionChoice,
)
from tenacity import retry, stop_after_attempt, wait_fixed


def rewrite(arg: RewriteRequest, user_settings: typing.FlatSettingsSchema = None):
    text = arg.text
    manner = arg.manner
    n_choices = arg.n_choices
    temperature = arg.temperature

    if user_settings is not None:
        openai.api_key = user_settings.openai_api_key
        model = user_settings.openai_chat_model
    else:
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        model = "gpt-3.5-turbo"

    # there are 1.33 tokens per word on average
    # seems reasonable to require a max_tokens roughly equivalent to our input text
    # https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them
    max_tokens = int(round(len(text.split(" ")) * 1.33))

    logger.info(f"Calling rewrite with the following parameters: {arg.dict()}")

    prompt = prompts.create_prompt_for_rewrite(text, manner)
    chat = Rewriter(prompt, n_choices, temperature, max_tokens, model)

    try:
        choices = chat.get_response(response_type=RewriteChoice)
    except Exception as e:
        logger.error(e)
        response = typing.RewriteResponse(
            status=typing.ResponseStatus.ERROR,
            message=str(e),
            choices=[],
        )
        return response

    logger.info(f"Returning {len(choices)} rewrite choices to client: {choices}")
    response = typing.RewriteResponse(
        status=typing.ResponseStatus.OK,
        message="",
        choices=[r.dict() for r in choices],
    )
    return response


def complete_text(
    request: TextCompletionRequest, user_settings: typing.FlatSettingsSchema = None
):
    if user_settings is not None:
        openai.api_key = user_settings.openai_api_key
        model = user_settings.openai_chat_model
    else:
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        model = "gpt-3.5-turbo"

    logger.info(
        f"Calling text completion with the following parameters: {request.dict()}"
    )
    prompt = prompts.create_prompt_for_text_completion(request)
    chat = Rewriter(
        prompt,
        n_choices=request.n_choices,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        model=model,
    )

    try:
        choices = chat.get_response(response_type=TextCompletionChoice)
    except Exception as e:
        logger.error(e)
        response = typing.TextCompletionResponse(
            status=typing.ResponseStatus.ERROR,
            message=str(e),
            choices=[],
        )
        return response

    logger.info(f"Trimming completion prefix text from completion choices: {choices}")
    choices = shared.trim_completion_prefix_from_choices(
        prefix=request.text, choices=choices
    )
    logger.info(f"Returning {len(choices)} completion choices to client: {choices}")

    response = typing.TextCompletionResponse(
        status=typing.ResponseStatus.OK,
        message="",
        choices=[r.dict() for r in choices],
    )
    return response


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
    model : str, optional, default="gpt-3.5-turbo"
        The name of the OpenAI model to use.
    """

    def __init__(
        self,
        prompt: str,
        n_choices: int = 1,
        temperature: float = 0.7,
        max_tokens: int = 512,
        model: str = "gpt-3.5-turbo",
    ):
        self.prompt = prompt
        self.n_choices = int(n_choices)
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.model = model

    def get_response(self, response_type: TextSuggestionChoice):
        messages = self.prepare_messages_for_chat(self.prompt)
        response = self.call_model(messages)
        response = self.prepare_choices_for_client(
            response, response_type=response_type
        )
        return response

    def prepare_choices_for_client(
        self, response: dict, response_type: TextSuggestionChoice
    ) -> list[TextSuggestionChoice]:
        return [
            response_type(
                index=choice["index"], text=choice["message"]["content"].strip()
            )
            for choice in response["choices"]
        ]

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
    def call_model(self, messages: list):
        logger.info(
            f"Calling OpenAI chat API with the following input message(s): {messages}"
        )
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=messages,
            n=self.n_choices,  # number of completions to generate
            temperature=self.temperature,
            # maximum number of tokens to generate (1 word ~= 1.33 tokens)
            max_tokens=self.max_tokens,
        )
        logger.info(f"Received response from OpenAI chat API: {response}")
        return response

    def prepare_messages_for_chat(self, text: str) -> list:
        messages = [
            {"role": "user", "content": text},
        ]
        return messages
