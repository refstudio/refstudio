from dotenv import load_dotenv
from fastapi import FastAPI
from sidecar import (
    chat as chat_module,
    ingest as ingest_module,
    rewrite as rewrite_module,
    search as search_module,
    storage
)
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
async def ingest() -> IngestResponse:
    # response = ingest.run_ingest()
    raise NotImplementedError("Ingest is not supported for the HTTP sidecar API.")


@sidecar_api.get("/ingest_status")
async def get_statuses() -> IngestStatusResponse:
    response = ingest_module.get_statuses()
    return response


@sidecar_api.post("/ingest_references")
async def get_references(req: IngestRequest) -> IngestResponse:
    response = ingest_module.get_references(req)
    return response


@sidecar_api.post("/update")
async def update(req: ReferenceUpdate) -> UpdateStatusResponse:
    response = storage.update_reference(req)
    return response


@sidecar_api.post("/delete")
async def delete(req: DeleteRequest) -> DeleteStatusResponse:
    response = storage.delete_references(req)
    return response


@sidecar_api.post("/rewrite")
async def rewrite(req: RewriteRequest) -> RewriteResponse:
    response = rewrite_module.rewrite(req)
    return response


@sidecar_api.post("/completion")
async def completion(req: TextCompletionRequest) -> TextCompletionResponse:
    response = rewrite_module.complete_text(req)
    return response


@sidecar_api.post("/chat")
async def chat(req: ChatRequest) -> ChatResponse:
    response = chat_module.ask_question(req)
    return response


@sidecar_api.post("/search")
async def search(req: SearchRequest) -> SearchResponse:
    response = search_module.search_s2(req)
    return response