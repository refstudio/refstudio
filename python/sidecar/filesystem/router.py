import os
import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sidecar.projects.service import get_project_path

router = APIRouter(
    prefix="/fs",
    tags=["filesystem"],
)


@router.put("/{project_id}/{filepath:path}")
async def create_file(project_id: str, filepath: Path, file: UploadFile = File(...)):
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
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


@router.get("/{project_id}/{filepath:path}")
async def read_file(project_id: str, filepath: Path):
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    filepath = project_path / filepath

    if not filepath.exists():
        return {
            "status": "error",
            "message": "File not found",
            "filepath": filepath,
        }
    return FileResponse(filepath)


@router.head("/{project_id}/{filepath:path}", status_code=200)
async def head_file(project_id: str, filepath: Path):
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
    filepath = project_path / filepath

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/{project_id}/{filepath:path}")
async def delete_file(project_id: str, filepath: Path):
    user_id = "user1"
    project_path = get_project_path(user_id, project_id)
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
