from fastapi import APIRouter
from sidecar.projects.service import get_project_path
from sidecar.references import ingest, storage
from sidecar.references.schemas import (
    DeleteRequest,
    DeleteStatusResponse,
    IngestRequest,
    IngestResponse,
    Reference,
    ReferencePatch,
    UpdateStatusResponse,
)
from sidecar.typing import EmptyRequest

router = APIRouter(
    prefix="/references",
    tags=["references"],
)


@router.get("/{project_id}")
async def list_references(project_id: str) -> list[Reference]:
    """
    Returns a list of references for the current user
    """
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    try:
        store.load()
    except FileNotFoundError:
        # no references have been ingested yet
        return []
    return store.references


@router.post("/{project_id}")
async def ingest_references(project_id: str, payload: EmptyRequest) -> IngestResponse:
    """
    Ingests references from PDFs in the project uploads directory
    """
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    uploads_dir = project_path / "uploads"
    req = IngestRequest(pdf_directory=str(uploads_dir))
    response = ingest.run_ingest(req)
    return response


@router.get("/{project_id}/{reference_id}")
async def http_get(project_id: str, reference_id: str) -> Reference | None:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.get_reference(reference_id)
    return response


@router.patch("/{project_id}/{reference_id}")
async def http_update(
    project_id: str, reference_id: str, req: ReferencePatch
) -> UpdateStatusResponse:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.update(reference_id, req)
    return response


@router.delete("/{project_id}/{reference_id}")
async def http_delete(project_id: str, reference_id: str) -> DeleteStatusResponse:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.delete(reference_ids=[reference_id])
    return response


@router.post("/{project_id}/bulk_delete")
async def http_bulk_delete(project_id: str, req: DeleteRequest) -> DeleteStatusResponse:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.delete(reference_ids=req.reference_ids, all_=req.all)
    return response
