import sidecar
from litestar import get, post
from sidecar._typing import (RewriteMannerType, RewriteRequest,
                             RewriteResponse, TextCompletionRequest,
                             TextCompletionResponse)


@get('/')
def index() -> dict[str, str]:
    return {"message": 'Hello, world!'}



@post('/rewrite')
def rewrite(
    text: str,
    manner: RewriteMannerType = "concise",
    n_choices: int = 1,
    temperature: float = 0.7
) -> RewriteResponse:
    req = RewriteRequest(
        text=text,
        manner=manner,
        n_choices=n_choices,
        temperature=temperature
    )
    return sidecar.rewrite.rewrite(req)


@post('/completion')
def completion(
    text: str,
    n_choices: int = 1,
    temperature: float = 0.7,
    max_tokens: int = 512,
    title: str = None,
    abstract: str = None
) -> TextCompletionResponse:
    req = TextCompletionRequest(
        text=text,
        n_choices=n_choices,
        temperature=temperature,
        max_tokens=max_tokens,
        title=title,
        abstract=abstract
    )
    return sidecar.rewrite.complete_text(req)
