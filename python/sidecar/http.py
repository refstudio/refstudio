import sys

from dotenv import load_dotenv
from fastapi import FastAPI
from sidecar import chat, ingest, rewrite, search, storage
from sidecar.typing import (ChatRequest, ChatResponse, DeleteRequest,
                            DeleteStatusResponse, IngestRequest,
                            IngestResponse, IngestStatusResponse,
                            ReferenceUpdate, RewriteRequest, RewriteResponse,
                            SearchRequest, SearchResponse,
                            TextCompletionRequest, TextCompletionResponse,
                            UpdateStatusResponse)

load_dotenv()

sidecar_api = FastAPI()  # Legacy API for existing sidecar cli functionality


@sidecar_api.get("/")
async def sidecar_index():
    return {"message": "Hello World from the Sidecar API"}


@sidecar_api.post("/ingest")
async def http_ingest() -> IngestResponse:
    # response = ingest.run_ingest()
    raise NotImplementedError("Ingest is not yet implemented")


@sidecar_api.get("/ingest_status")
async def http_get_statuses() -> IngestStatusResponse:
    response = ingest.get_statuses()
    return response


@sidecar_api.post("/ingest_references")
async def http_get_references(req: IngestRequest) -> IngestResponse:
    response = ingest.get_references(req)
    return response


@sidecar_api.post("/update")
async def http_update(req: ReferenceUpdate) -> UpdateStatusResponse:
    response = storage.update_reference(req)
    return response


@sidecar_api.post("/delete")
async def http_delete(req: DeleteRequest) -> DeleteStatusResponse:
    response = storage.delete_references(req)
    return response


@sidecar_api.post("/rewrite")
async def http_rewrite(req: RewriteRequest) -> RewriteResponse:
    response = rewrite.rewrite(req)
    return response


@sidecar_api.post("/completion")
async def http_completion(req: TextCompletionRequest) -> TextCompletionResponse:
    response = rewrite.complete_text(req)
    return response


@sidecar_api.post("/chat")
async def http_chat(req: ChatRequest) -> ChatResponse:
    response = chat.ask_question(req)
    return response


@sidecar_api.post("/search")
async def http_search(req: SearchRequest) -> SearchResponse:
    response = search.search_s2(req)
    return response