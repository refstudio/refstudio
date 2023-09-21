import os
import re

import litellm
import openai
from sidecar.ai.prompts import (
    create_prompt_for_rewrite,
    create_prompt_for_text_completion,
)
from sidecar.ai.schemas import (
    RewriteChoice,
    RewriteRequest,
    RewriteResponse,
    TextCompletionChoice,
    TextCompletionRequest,
    TextCompletionResponse,
    TextSuggestionChoice,
)
from sidecar.config import logger
from sidecar.settings.schemas import FlatSettingsSchema, ModelProvider
from sidecar.typing import ResponseStatus
from tenacity import retry, stop_after_attempt, wait_fixed


def trim_completion_prefix_from_choices(
    prefix: str, choices: list[TextCompletionChoice]
) -> list[TextCompletionChoice]:
    """
    Trim a text completion prefix from a list of text completion choices.

    Parameters
    ----------
    prefix : str
        The prefix to trim from the text completion choices.
    choices : List[TextCompletionChoice]
        The text completion choices to trim the prefix from.

    Returns
    -------
    List[TextCompletionChoice]
        The text completion choices with the prefix trimmed.

    Examples
    --------
    >>> prefix = "This is a prefix and "
    >>> choices = [
    ...     TextCompletionChoice(index=0, text="This is a prefix and more text."),
    ...     TextCompletionChoice(index=1, text="This is a prefix and other text."),
    ...     TextCompletionChoice(index=2, text="some text."),
    ... ]
    >>> trimmed_choices = trim_completion_prefix_from_choices(prefix, choices)
    >>> trimmed_choices[0].text
    'more text.'
    >>> trimmed_choices[1].text
    'other text.'
    >>> trimmed_choices[2].text
    'some text.'
    """
    # split prefix into sentences
    sentence_splitter_regex = r"(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s"
    prefix_sentences = re.split(sentence_splitter_regex, prefix)

    # and remove any sentences from the prompt that were included in the responses
    for choice in choices:
        for sentence in prefix_sentences:
            if choice.text.strip().startswith(sentence.strip()):
                choice.text = choice.text[len(sentence) :].strip()

            if "[MASK]" in choice.text:
                choice.text = choice.text.replace("[MASK]", "")
    return choices


async def rewrite(arg: RewriteRequest, user_settings: FlatSettingsSchema = None):
    text = arg.text
    manner = arg.manner
    n_choices = arg.n_choices
    temperature = arg.temperature

    if user_settings is None:
        # this is for local dev environment
        openai.api_key = os.environ.get("API_KEY")
        model = "gpt-3.5-turbo"
    elif user_settings.model_provider == ModelProvider.OPENAI:
        openai.api_key = user_settings.api_key
        model = user_settings.model
    elif user_settings.model_provider == ModelProvider.OLLAMA:
        model = "llama2"

    # there are 1.33 tokens per word on average
    # seems reasonable to require a max_tokens roughly equivalent to our input text
    # https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them
    max_tokens = int(round(len(text.split(" ")) * 1.33))

    logger.info(f"Calling rewrite with the following parameters: {arg.dict()}")

    prompt = create_prompt_for_rewrite(text, manner)
    chat = Rewriter(prompt, n_choices, temperature, max_tokens, model)

    try:
        choices = await chat.get_response(response_type=RewriteChoice)
    except Exception as e:
        logger.error(e)
        response = RewriteResponse(
            status=ResponseStatus.ERROR,
            message=str(e),
            choices=[],
        )
        return response

    logger.info(f"Returning {len(choices)} rewrite choices to client: {choices}")
    response = RewriteResponse(
        status=ResponseStatus.OK,
        message="",
        choices=[r.dict() for r in choices],
    )
    return response


async def complete_text(
    request: TextCompletionRequest, user_settings: FlatSettingsSchema = None
):
    if user_settings is None:
        # this is for local dev environment
        openai.api_key = os.environ.get("API_KEY")
        model = "gpt-3.5-turbo"
    elif user_settings.model_provider == ModelProvider.OPENAI:
        openai.api_key = user_settings.api_key
        model = user_settings.model
    elif user_settings.model_provider == ModelProvider.OLLAMA:
        model = "llama2"

    logger.info(
        f"Calling text completion with the following parameters: {request.dict()}"
    )
    prompt = create_prompt_for_text_completion(request)
    chat = Rewriter(
        prompt,
        n_choices=request.n_choices,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        model=model,
    )

    try:
        choices = await chat.get_response(response_type=TextCompletionChoice)
    except Exception as e:
        logger.error(e)
        response = TextCompletionResponse(
            status=ResponseStatus.ERROR,
            message=str(e),
            choices=[],
        )
        return response

    logger.info(f"Trimming completion prefix text from completion choices: {choices}")
    choices = trim_completion_prefix_from_choices(prefix=request.text, choices=choices)
    logger.info(f"Returning {len(choices)} completion choices to client: {choices}")

    response = TextCompletionResponse(
        status=ResponseStatus.OK,
        message="",
        choices=[r.dict() for r in choices],
    )
    return response


class Rewriter:
    """
    Rewrite or complete text using the specified model.

    Parameters
    ----------
    prompt : str
        The prompt to send to the LLM.
    n_choices : int
        The number of choices to return. Not valid for `llama2`.
    temperature : float, optional, default=0.7
        The temperature to use when generating text. Not valid for `llama2`.
    max_tokens : int, optional, default=512
        The maximum number of tokens to generate. Not valid for `llama2`.
    model : str, optional, default="gpt-3.5-turbo"
        The name of the model to use (must be an OpenAI model or `llama2`).
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

    async def get_response(self, response_type: TextSuggestionChoice):
        messages = self.prepare_messages_for_chat(self.prompt)
        response = await self.call_model(messages)
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

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1), reraise=True)
    async def call_model(self, messages: list):
        logger.info(
            f"Calling {self.model} rewrite API with input message(s): {messages}"
        )
        params = {
            "model": self.model,
            "messages": messages,
            "n": self.n_choices,  # number of completions to generate
            "temperature": self.temperature,
            # maximum number of tokens to generate (1 word ~= 1.33 tokens)
            "max_tokens": self.max_tokens,
        }

        if self.model == "llama2":
            # NOTE: Ollama does not support the following parameters:
            # - n
            # - max_tokens
            # - temperature
            params["api_base"] = "http://localhost:11434"
            params["custom_llm_provider"] = "ollama"

        response = await litellm.acompletion(**params)

        logger.info(f"Received response from {self.model} chat API: {response}")
        return response

    def prepare_messages_for_chat(self, text: str) -> list:
        messages = [
            {"role": "user", "content": text},
        ]
        return messages
