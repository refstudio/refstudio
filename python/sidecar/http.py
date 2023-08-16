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

app = FastAPI()
v0 = FastAPI()


@v0.get("/")
async def index():
    return {"message": "Hello World"}


@v0.post("/ingest/upload")
async def upload() -> IngestResponse:
    # response = sidecar.ingest.run_ingest()
    raise NotImplementedError("Upload is not yet implemented")


@v0.get("/ingest/status")
async def get_statuses() -> IngestStatusResponse:
    response = sidecar.ingest.get_statuses()
    return response


@v0.get("/ingest/references")
async def get_references(req: IngestRequest) -> IngestResponse:
    response = sidecar.ingest.get_references(req)
    return response


@v0.post("/rewrite")
async def rewrite(req: RewriteRequest) -> RewriteResponse:
    response = sidecar.rewrite.rewrite(req)
    return response


@v0.post("/completion")
async def completion(req: TextCompletionRequest) -> TextCompletionResponse:
    response = sidecar.rewrite.complete_text(req)
    return response


@v0.post("/chat")
async def chat(req: ChatRequest) -> ChatResponse:
    response = sidecar.chat.ask_question(req)
    return response


@v0.post("/update")
async def update(req: ReferenceUpdate) -> UpdateStatusResponse:
    response = sidecar.storage.update_reference(req)
    return response


@v0.delete("/delete")
async def delete(req: DeleteRequest) -> DeleteStatusResponse:
    response = sidecar.storage.delete_references(req)
    return response


@v0.post("/search")
async def search(req: SearchRequest) -> SearchResponse:
    response = sidecar.search.search_s2(req)
    return response


app.mount("/api/v0", v0)