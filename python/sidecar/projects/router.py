from uuid import uuid4

from fastapi import APIRouter
from sidecar.projects import service
from sidecar.projects.schemas import (
    ProjectBase,
    ProjectCreateRequest,
    ProjectDetailsResponse,
    ProjectFileTreeResponse,
    ProjectListResponse,
)
from sidecar.typing import ResponseStatus, StatusResponse

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
)


@router.get("/")
async def list_projects() -> ProjectListResponse:
    """
    Returns a list of projects for the current user
    """
    user_id = "user1"
    projects = []
    for proj in service.get_projects_for_user(user_id):
        projects.append(ProjectBase(**proj.dict()))
    return ProjectListResponse(projects=projects)


@router.post("/")
async def create_project(req: ProjectCreateRequest) -> ProjectBase:
    """
    Creates a project, and a directory in the filesystem
    """
    user_id = "user1"
    project_id = str(uuid4())
    project = service.create_project(
        user_id, project_id, req.project_name, req.project_path
    )
    return ProjectBase(id=project.id, name=project.name)


@router.get("/{project_id}")
async def get_project(project_id: str) -> ProjectDetailsResponse:
    """
    Returns details about a project
    """
    user_id = "user1"
    project = service.get_project(user_id, project_id)
    return ProjectDetailsResponse(**project.dict())


@router.delete("/{project_id}")
async def delete_project(project_id: str) -> StatusResponse:
    """
    Deletes a project directory and all files in it
    """
    user_id = "user1"
    try:
        service.delete_project(user_id, project_id)
    except KeyError:
        return StatusResponse(status=ResponseStatus.ERROR, message="Project not found")
    return StatusResponse(status=ResponseStatus.OK)


@router.get("/{project_id}/files")
async def get_project_files(project_id: str) -> ProjectFileTreeResponse:
    user_id = "user1"
    return service.get_project_files(user_id, project_id)
