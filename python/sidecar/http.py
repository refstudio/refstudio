from dotenv import load_dotenv
from fastapi import FastAPI

import sidecar
from sidecar.typing import (
    ChatRequest,
    ChatResponse,
    DeleteRequest,
    DeleteStatusResponse,
    IngestRequest,
    IngestResponse,
    IngestStatusResponse,
    ReferenceUpdate,
    RewriteRequest,
    RewriteResponse,
    SearchRequest,
    SearchResponse,
    TextCompletionRequest,
    TextCompletionResponse,
    UpdateStatusResponse,
)

load_dotenv()

sidecar_api = FastAPI()  # Legacy API for existing sidecar cli functionality


@sidecar_api.get("/")
async def sidecar_index():
    return {"message": "Hello World from the Sidecar API"}


@sidecar_api.post("/references")
async def get_references(req: IngestRequest) -> IngestResponse:
    response = sidecar.ingest.get_references(req)
    return response


@sidecar_api.post("/references/upload")
async def upload() -> IngestResponse:
    # response = sidecar.ingest.run_ingest()
    raise NotImplementedError("Upload is not yet implemented")


@sidecar_api.get("/references/status")
async def get_statuses() -> IngestStatusResponse:
    response = sidecar.ingest.get_statuses()
    return response


@sidecar_api.post("/references/update")
async def update(req: ReferenceUpdate) -> UpdateStatusResponse:
    response = sidecar.storage.update_reference(req)
    return response


@sidecar_api.post("/references/delete")
async def delete(req: DeleteRequest) -> DeleteStatusResponse:
    response = sidecar.storage.delete_references(req)
    return response


@sidecar_api.post("/ai/rewrite")
async def rewrite(req: RewriteRequest) -> RewriteResponse:
    response = sidecar.rewrite.rewrite(req)
    return response


@sidecar_api.post("/ai/completion")
async def completion(req: TextCompletionRequest) -> TextCompletionResponse:
    response = sidecar.rewrite.complete_text(req)
    return response


@sidecar_api.post("/ai/chat")
async def chat(req: ChatRequest) -> ChatResponse:
    response = sidecar.chat.ask_question(req)
    return response


@sidecar_api.post("/search/s2")
async def search(req: SearchRequest) -> SearchResponse:
    response = sidecar.search.search_s2(req)
    return response