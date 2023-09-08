from sidecar.filesystem.schemas import FileEntry, FolderEntry
from sidecar.typing import RefStudioModel


class ProjectBase(RefStudioModel):
    id: str
    name: str


class Project(ProjectBase):
    path: str


class ProjectStore(RefStudioModel):
    projects: dict[str, Project]


class ProjectDetailsResponse(ProjectBase):
    # simple pass for now, but we'll eventually extend this
    pass


class ProjectListResponse(RefStudioModel):
    projects: list[ProjectBase]


class ProjectFileTreeResponse(RefStudioModel):
    contents: list[FileEntry | FolderEntry]


class ProjectCreateRequest(RefStudioModel):
    project_name: str
    """The name of the project"""
    project_path: str = None
    """
    The path to the project directory. Only necessary for Desktop.
    For web, the project is stored in a private directory on the server.
    """
