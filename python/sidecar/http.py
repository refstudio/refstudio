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


@sidecar_api.post("/ingest")
async def upload() -> IngestResponse:
    # response = sidecar.ingest.run_ingest()
    raise NotImplementedError("Ingest is not yet implemented")


@sidecar_api.get("/ingest_status")
async def get_statuses() -> IngestStatusResponse:
    response = sidecar.ingest.get_statuses()
    return response


@sidecar_api.post("/ingest_references")
async def get_references(req: IngestRequest) -> IngestResponse:
    response = sidecar.ingest.get_references(req)
    return response


@sidecar_api.post("/update")
async def update(req: ReferenceUpdate) -> UpdateStatusResponse:
    response = sidecar.storage.update_reference(req)
    return response


@sidecar_api.post("/delete")
async def delete(req: DeleteRequest) -> DeleteStatusResponse:
    response = sidecar.storage.delete_references(req)
    return response


@sidecar_api.post("/rewrite")
async def rewrite(req: RewriteRequest) -> RewriteResponse:
    response = sidecar.rewrite.rewrite(req)
    return response


@sidecar_api.post("/completion")
async def completion(req: TextCompletionRequest) -> TextCompletionResponse:
    response = sidecar.rewrite.complete_text(req)
    return response


@sidecar_api.post("/chat")
async def chat(req: ChatRequest) -> ChatResponse:
    response = sidecar.chat.ask_question(req)
    return response


@sidecar_api.post("/search")
async def search(req: SearchRequest) -> SearchResponse:
    response = sidecar.search.search_s2(req)
    return response