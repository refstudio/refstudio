from sidecar.typing import RefStudioModel, ResponseStatus

try:
    # introduced in Python 3.11 ...
    from enum import StrEnum
except ImportError:
    # ... but had some breaking changes
    # https://github.com/python/cpython/issues/100458
    # Python 3.10 and below
    from strenum import StrEnum


class TextSuggestionChoice(RefStudioModel):
    index: int
    text: str


class RewriteMannerType(StrEnum):
    CONCISE = "concise"
    ELABORATE = "elaborate"
    SCHOLARLY = "scholarly"


class RewriteRequest(RefStudioModel):
    text: str
    manner: RewriteMannerType = RewriteMannerType.CONCISE
    n_choices: int = 1
    temperature: float = 0.7


class RewriteChoice(TextSuggestionChoice):
    pass


class RewriteResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    choices: list[RewriteChoice]


class TextCompletionRequest(RefStudioModel):
    text: str
    n_choices: int = 1
    temperature: float = 0.7
    max_tokens: int = 512
    title: str = None
    abstract: str = None


class TextCompletionChoice(TextSuggestionChoice):
    pass


class TextCompletionResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    choices: list[TextCompletionChoice]


class ChatRequest(RefStudioModel):
    text: str
    n_choices: int = 1
    temperature: float = 0.7


class ChatResponseChoice(TextSuggestionChoice):
    pass


class ChatResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    choices: list[ChatResponseChoice]
    choices: list[ChatResponseChoice]
