import os
import shutil
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse

from sidecar import chat, ingest, projects, rewrite, search, storage, settings
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
    UpdateSettingsRequest,
    SettingsResponse,
)

load_dotenv()

sidecar_api = FastAPI()  # Legacy API for existing sidecar cli functionality
filesystem_api = FastAPI()  # API for interacting with the filesystem
project_api = FastAPI()  # API for interacting with projects
settings_api = FastAPI()  # API for interacting with settings


# Sidecar API
# -----------
@sidecar_api.post("/ingest")
async def http_ingest(project_id: str) -> IngestResponse:
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    req = IngestRequest(pdf_directory=project_path)
    response = ingest.run_ingest(req)
    return response


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
async def create_project(project_path: str = None):
    """
    Creates a project directory in the filesystem

    Parameters
    ----------
    project_path : str
        The path to the project directory. Only necessary for Desktop.
        For web, the project is stored in a private directory on the server.
    """
    user_id = "user1"
    project_id = str(uuid4())
    project_path = projects.create_project(user_id, project_id, project_path)
    return {
        project_id: project_path,
    }


@project_api.get("/{project_id}")
async def get_project(project_id: str):
    """
    Returns the project path and a list of files in the project
    """
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    filepaths = projects.get_project_files(user_id, project_id)
    return {
        "project_id": project_id,
        "project_path": project_path,
        "filepaths": filepaths,
    }


@project_api.delete("/{project_id}")
async def delete_project(project_id: str):
    """
    Deletes a project directory and all files in it
    """
    user_id = "user1"
    projects.delete_project(user_id, project_id)
    return {
        "status": "success",
        "message": "Project deleted",
        "project_id": project_id,
    }


@project_api.get("/{project_id}/files")
async def get_project_files(project_id: str):
    user_id = "user1"
    filepaths = projects.get_project_files(user_id, project_id)
    return filepaths



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


# Settings API
# --------------
@settings_api.get("/")
async def get_settings() -> SettingsResponse:
    user_id = "user1"
    return settings.get_settings_for_user(user_id)


@settings_api.post("/")
async def update_settings(req: UpdateSettingsRequest) -> SettingsResponse:
    user_id = "user1"
    return settings.update_settings_for_user(user_id, req)