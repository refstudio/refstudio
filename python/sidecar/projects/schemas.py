from __future__ import annotations

from sidecar.typing import RefStudioModel


class FileEntryBase(RefStudioModel):
    name: str
    path: str


class FileEntry(FileEntryBase):
    file_extension: str


class FolderEntry(FileEntryBase):
    children: list[FileEntry | FolderEntry] = []


class ProjectDetailsResponse(RefStudioModel):
    id: str
    name: str
    path: str


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


FolderEntry.update_forward_refs()
