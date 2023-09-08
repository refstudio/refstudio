from pathlib import Path

from sidecar.filesystem.schemas import FileEntry, FolderEntry


def create_file_entry(path: Path, relative_to: Path) -> FileEntry:
    return FileEntry(
        name=path.name,
        path=str(path.relative_to(relative_to)),
        file_extension=path.suffix,
    )


def traverse_directory(
    directory: Path, relative_to: Path, ignore_hidden: bool = True
) -> list[FileEntry | FolderEntry]:
    """
    Traverse a directory recursively and return a list of all files.
    """
    contents = []
    for obj in directory.glob("*"):
        if ignore_hidden and obj.name.startswith("."):
            continue
        if obj.is_dir():
            contents.append(
                FolderEntry(
                    name=obj.name,
                    path=str(obj.relative_to(relative_to)),
                    children=traverse_directory(obj, relative_to=relative_to),
                )
            )
        else:
            contents.append(create_file_entry(obj, relative_to=relative_to))
    return contents
