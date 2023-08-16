import sidecar
from fastapi import FastAPI
from sidecar._typing import (RewriteMannerType, RewriteRequest,
                             RewriteResponse, TextCompletionRequest,
                             TextCompletionResponse)

app = FastAPI()


@app.get("/")
async def index():
    return {"message": "Hello World"}


@app.get("/rewrite")
async def rewrite(
    text: str,
    manner: RewriteMannerType = "concise",
    n_choices: int = 1,
    temperature: float = 0.7
) -> RewriteResponse:
    request = RewriteRequest(
        text=text,
        manner=manner,
        n_choices=n_choices,
        temperature=temperature
    )
    response = sidecar.rewrite.rewrite(request)
    return response


@app.get("/completion")
async def completion(
    text: str,
    n_choices: int = 1,
    temperature: float = 0.7,
    max_tokens: int = 512,
    title: str = None,
    abstract: str = None
) -> TextCompletionResponse:
    request = TextCompletionRequest(
        text=text,
        n_choices=n_choices,
        temperature=temperature,
        max_tokens=max_tokens,
        title=title,
        abstract=abstract
    )
    response = sidecar.rewrite.complete_text(request)
    return response