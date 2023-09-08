import os
import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sidecar.filesystem.schemas import CreateFileResponse, DeleteFileResponse
from sidecar.projects.service import get_project_path
from sidecar.typing import ResponseStatus

router = APIRouter(
    prefix="/fs",
    tags=["filesystem"],
)


@router.put("/{project_id}/{filepath:path}")
async def create_file(
    project_id: str, filepath: Path, file: UploadFile = File(...)
) -> CreateFileResponse:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    filepath = project_path / filepath

    if not filepath.exists():
        filepath.parent.mkdir(parents=True, exist_ok=True)

    try:
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        response = CreateFileResponse(
            status=ResponseStatus.ERROR,
            message=f"Error uploading file: {e}",
        )
        file.file.close()
        return response

    response = CreateFileResponse(
        status=ResponseStatus.OK,
        message="File uploaded",
        filepath=str(filepath),
    )
    file.file.close()
    return response


@router.get("/{project_id}/{filepath:path}")
async def read_file(project_id: str, filepath: Path) -> FileResponse:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    filepath = project_path / filepath
    return FileResponse(filepath)


@router.head("/{project_id}/{filepath:path}", status_code=200)
async def head_file(project_id: str, filepath: Path) -> None:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    filepath = project_path / filepath

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/{project_id}/{filepath:path}")
async def delete_file(project_id: str, filepath: Path) -> DeleteFileResponse:
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    filepath = project_path / filepath
    try:
        os.remove(filepath)
    except Exception as e:
        return DeleteFileResponse(
            status=ResponseStatus.ERROR,
            message=f"Error deleting file: {e}",
            filepath=str(filepath),
        )
    return DeleteFileResponse(
        status=ResponseStatus.OK,
        message="File deleted",
        filepath=str(filepath),
    )
