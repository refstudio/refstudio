from __future__ import annotations

from sidecar.typing import RefStudioModel


class FileEntryBase(RefStudioModel):
    name: str
    path: str


class FileEntry(FileEntryBase):
    file_extension: str


class FolderEntry(FileEntryBase):
    children: list[FileEntry | FolderEntry] = []


FolderEntry.update_forward_refs()
