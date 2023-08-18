import shutil
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile

import sidecar
from sidecar import filesystem
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


# Sidecar API
# -----------
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


# Filesystem API
# --------------
@filesystem_api.get("/")
async def filesystem_index():
    return {"message": "Hello World from the Filesystem API"}


@filesystem_api.get("/project")
async def get_project(project_id: str):
    user_id = "user1"
    project_path = filesystem.get_project_path(user_id, project_id)
    return project_path


@filesystem_api.post("/project")
async def create_project(project_id: str):
    user_id = "user1"
    project_path = filesystem.create_project(user_id, project_id)
    return {project_id: project_path}


@filesystem_api.get("/project/files")
async def get_project_files(project_id: str):
    user_id = "user1"
    filepaths = filesystem.get_project_files(user_id, project_id)
    return filepaths


@filesystem_api.post("/create_file")
async def create_file(project_id: str, file: UploadFile = File(...)):
    user_id = "user1"
    project_path = filesystem.get_project_path(user_id, project_id)
    filepath = project_path / file.filename
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


@filesystem_api.get("/read_file")
async def read_file(project_id, filename):
    # TODO
    # response = filesystem.read_file(project_id, filename)
    return 


@filesystem_api.delete("/delete_file")
async def delete_file(project_id: str, filename: str):
    user_id = "user1"
    project_path = filesystem.get_project_path(user_id, project_id)
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


@filesystem_api.post("/file/rename")
async def rename_file(project_id: str, old_filename: str, new_filename):
    user_id = "user1"
    project_path = filesystem.get_project_path(user_id, project_id)
    response = filesystem.rename_file(
        project_id, old_filename, new_filename
    )
    return response