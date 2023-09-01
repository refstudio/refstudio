from uuid import uuid4

from fastapi import APIRouter
from sidecar.projects import service
from sidecar.projects.schemas import (
    ProjectCreateRequest,
    ProjectDetailsResponse,
    ProjectFileTreeResponse,
)

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
)


@router.get("/")
async def list_projects():
    """
    Returns a list of projects for the current user
    """
    user_id = "user1"
    projects_dict = service.read_project_path_storage(user_id)
    return projects_dict


@router.post("/")
async def create_project(req: ProjectCreateRequest):
    """
    Creates a project, and a directory in the filesystem
    """
    user_id = "user1"
    project_id = str(uuid4())
    project_path = service.create_project(
        user_id, project_id, req.project_name, req.project_path
    )
    return {
        project_id: {
            "project_name": req.project_name,
            "project_path": project_path,
        }
    }


@router.get("/{project_id}")
async def get_project(project_id: str) -> ProjectDetailsResponse:
    """
    Returns details about a project
    """
    user_id = "user1"
    return service.get_project_details(user_id, project_id)


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    """
    Deletes a project directory and all files in it
    """
    user_id = "user1"
    try:
        service.delete_project(user_id, project_id)
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


@router.get("/{project_id}/files")
async def get_project_files(project_id: str) -> ProjectFileTreeResponse:
    user_id = "user1"
    return service.get_project_files(user_id, project_id)
