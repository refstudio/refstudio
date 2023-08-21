import shutil
from typing import Annotated
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from sidecar import chat, filesystem, ingest, projects, rewrite, search, storage
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
filesystem_api = FastAPI()  # API for interacting with the filesystem
project_api = FastAPI()  # API for interacting with projects


# Sidecar API
# -----------
@sidecar_api.get("/")
async def sidecar_index():
    return {"message": "Hello World from the Sidecar API"}


@sidecar_api.post("/ingest")
async def http_ingest(project_id: str) -> IngestResponse:
    user_id = "user1"
    project_path = filesystem.get_project_path(user_id, project_id)
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


@project_api.get("/{project_id}/files")
async def get_project_files(project_id: str):
    user_id = "user1"
    filepaths = projects.get_project_files(user_id, project_id)
    return filepaths



# Filesystem API
# --------------
@filesystem_api.get("/")
async def filesystem_index():
    return {"message": "Hello World from the Filesystem API"}


@filesystem_api.put("/{project_id}/{filename}")
async def create_file(project_id: str, filename: str, file: UploadFile = File(...)):
    # TODO: make sure we can place PDFs in uploads directory
    # but refstudio documents should be written to root
    # client should determine where the file should get saved wtihin the project
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    filepath = project_path / filename
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


@filesystem_api.get("/{project_id}/{filename}")
async def read_file(project_id, filename):
    # TODO
    # response = filesystem.read_file(project_id, filename)
    return 


@filesystem_api.delete("/{project_id}/{filename}")
async def delete_file(project_id: str, filename: str):
    user_id = "user1"
    project_path = projects.get_project_path(user_id, project_id)
    filepath = project_path / filename
    try:
        _ = filesystem.delete_file(filepath)
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


@filesystem_api.post("/{project_id}/{old_filename}/{new_filename}")
async def rename_file(project_id: str, old_filename: str, new_filename):
    raise NotImplementedError("TODO - this isn't needed for the current web prototype")