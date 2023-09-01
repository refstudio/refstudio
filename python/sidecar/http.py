import os
import shutil
from pathlib import Path
from uuid import uuid4

import psutil
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sidecar import chat, ingest, projects, rewrite, settings, storage
from sidecar.typing import (
    ChatRequest,
    ChatResponse,
    DeleteRequest,
    DeleteStatusResponse,
    EmptyRequest,
    FlatSettingsSchema,
    FlatSettingsSchemaPatch,
    IngestRequest,
    IngestResponse,
    ProjectCreateRequest,
    ProjectDetailsResponse,
    ProjectFileTreeResponse,
    Reference,
    ReferencePatch,
    RewriteRequest,
    RewriteResponse,
    TextCompletionRequest,
    TextCompletionResponse,
    UpdateStatusResponse,
)

load_dotenv()

references_api = FastAPI()  # API for interacting with references
ai_api = FastAPI()  # API for interacting with AI
search_api = FastAPI()  # API for interacting with search
filesystem_api = FastAPI()  # API for interacting with the filesystem
project_api = FastAPI()  # API for interacting with projects
settings_api = FastAPI()  # API for interacting with settings

meta_api = FastAPI()
"""API for monitoring and controling the server"""


# AI API
# --------------
@ai_api.post("/rewrite")
async def http_ai_rewrite(req: RewriteRequest) -> RewriteResponse:
    user_id = "user1"
    user_settings = settings.get_settings_for_user(user_id)
    response = rewrite.rewrite(req, user_settings=user_settings)
    return response


@ai_api.post("/completion")
async def http_ai_completion(
    req: TextCompletionRequest,
) -> TextCompletionResponse:
    user_id = "user1"
    user_settings = settings.get_settings_for_user(user_id)
    response = rewrite.complete_text(req, user_settings=user_settings)
    return response


@ai_api.post("/{project_id}/chat")
async def http_ai_chat(
    project_id: str,
    req: ChatRequest,
) -> ChatResponse:
    user_id = "user1"
    user_settings = settings.get_settings_for_user(user_id)
    response = chat.ask_question(
        req, project_id=project_id, user_settings=user_settings
    )
    return response


# References API
# --------------
@references_api.get("/{project_id}")
async def list_references(project_id: str) -> list[Reference]:
    """
    Returns a list of references for the current user
    """
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    try:
        store.load()
    except FileNotFoundError:
        # no references have been ingested yet
        return []
    return store.references


@references_api.post("/{project_id}")
async def ingest_references(project_id: str, payload: EmptyRequest) -> IngestResponse:
    """
    Ingests references from PDFs in the project uploads directory
    """
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    uploads_dir = project_path / "uploads"
    req = IngestRequest(pdf_directory=str(uploads_dir))
    response = ingest.run_ingest(req)
    return response


@references_api.get("/{project_id}/{reference_id}")
async def http_get(project_id: str, reference_id: str) -> Reference | None:
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.get_reference(reference_id)
    return response


@references_api.patch("/{project_id}/{reference_id}")
async def http_update(
    project_id: str, reference_id: str, req: ReferencePatch
) -> UpdateStatusResponse:
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.update(reference_id, req)
    return response


@references_api.delete("/{project_id}/{reference_id}")
async def http_delete(project_id: str, reference_id: str) -> DeleteStatusResponse:
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.delete(reference_ids=[reference_id])
    return response


@references_api.post("/{project_id}/bulk_delete")
async def http_bulk_delete(project_id: str, req: DeleteRequest) -> DeleteStatusResponse:
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    store = storage.JsonStorage(project_path / ".storage" / "references.json")
    store.load()
    response = store.delete(reference_ids=req.reference_ids, all_=req.all)
    return response


# Project API
# --------------
@project_api.get("/")
async def list_projects():
    """
    Returns a list of projects for the current user
    """
    user_id = "user1"
    projects_dict = projects.read_project_path_storage(user_id)
    return projects_dict


@project_api.post("/")
async def create_project(req: ProjectCreateRequest):
    """
    Creates a project, and a directory in the filesystem
    """
    user_id = "user1"
    project_id = str(uuid4())
    project_path = projects.create_project(
        user_id, project_id, req.project_name, req.project_path
    )
    return {
        project_id: {
            "project_name": req.project_name,
            "project_path": project_path,
        }
    }


@project_api.get("/{project_id}")
async def get_project(project_id: str) -> ProjectDetailsResponse:
    """
    Returns details about a project
    """
    user_id = "user1"
    return projects.get_project_details(user_id, project_id)


@project_api.delete("/{project_id}")
async def delete_project(project_id: str):
    """
    Deletes a project directory and all files in it
    """
    user_id = "user1"
    try:
        projects.delete_project(user_id, project_id)
    except KeyError:
        return {
            "status": "error",
            "message": "Project not found",
            "project_id": project_id,
        }
    return {
        "status": "success",
        "message": "Project deleted",
        "project_id": project_id,
    }


@project_api.get("/{project_id}/files")
async def get_project_files(project_id: str) -> ProjectFileTreeResponse:
    user_id = "user1"
    return projects.get_project_files(user_id, project_id)


# Filesystem API
# --------------
@filesystem_api.put("/{project_id}/{filepath:path}")
async def create_file(project_id: str, filepath: Path, file: UploadFile = File(...)):
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    filepath = project_path / filepath

    if not filepath.exists():
        filepath.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        print(e)
    finally:
        file.file.close()
    return {
        "status": "success",
        "message": "File uploaded",
        "filepath": filepath,
    }


@filesystem_api.get("/{project_id}/{filepath:path}")
async def read_file(project_id: str, filepath: Path):
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    filepath = project_path / filepath

    if not filepath.exists():
        return {
            "status": "error",
            "message": "File not found",
            "filepath": filepath,
        }
    return FileResponse(filepath)


@filesystem_api.head("/{project_id}/{filepath:path}", status_code=200)
async def head_file(project_id: str, filepath: Path):
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    filepath = project_path / filepath

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")


@filesystem_api.delete("/{project_id}/{filepath:path}")
async def delete_file(project_id: str, filepath: Path):
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    filepath = project_path / filepath
    try:
        os.remove(filepath)
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error deleting file: {e}",
            "filepath": filepath,
        }
    return {
        "status": "success",
        "message": "File deleted",
        "filepath": filepath,
    }


@meta_api.get("/status")
async def status():
    return {"status": "ok"}


@meta_api.post("/shutdown")
async def shutdown():
    # See https://stackoverflow.com/a/74757349/388951
    parent_pid = os.getpid()
    parent = psutil.Process(parent_pid)
    for child in parent.children(recursive=True):
        child.kill()
    parent.kill()


# Settings API
# --------------
@settings_api.get("/")
async def get_settings() -> FlatSettingsSchema:
    user_id = "user1"
    return settings.get_settings_for_user(user_id)


@settings_api.put("/")
async def update_settings(req: FlatSettingsSchemaPatch) -> FlatSettingsSchema:
    user_id = "user1"
    return settings.update_settings_for_user(user_id, req)
    return settings.update_settings_for_user(user_id, req)
