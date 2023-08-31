import json
import shutil
from pathlib import Path

from sidecar import settings
from sidecar.typing import FileEntry, FolderEntry, ProjectFileTreeResponse

# Ensure that the server's path storage directory exists.
Path(settings.WEB_STORAGE_URL).mkdir(parents=True, exist_ok=True)


def make_projects_json_path(user_id: str) -> Path:
    filepath = Path(settings.WEB_STORAGE_URL / user_id / "projects.json")
    return filepath


def make_project_path(user_id: str, project_id: str) -> Path:
    filepath = Path(settings.WEB_STORAGE_URL / user_id / project_id)
    return filepath


def initialize_projects_json_storage(user_id: str) -> None:
    filepath = make_projects_json_path(user_id)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w") as f:
        json.dump({}, f)


def read_project_path_storage(user_id: str) -> dict[str, str]:
    filepath = make_projects_json_path(user_id)

    if not filepath.exists():
        initialize_projects_json_storage(user_id)

    with open(filepath, "r") as f:
        data = json.load(f)
    return data


def update_project_path_storage(
    user_id: str, project_id: str, project_name: str, project_path: str
) -> dict[str, str]:
    """
    Updates the path storage file, which is responsible for mapping a project id
    to the corresponding filepath for storing project files.
    """
    filepath = make_projects_json_path(user_id)

    if not filepath.exists():
        initialize_projects_json_storage(user_id)

    data = read_project_path_storage(user_id)

    with open(filepath, "w") as f:
        data[project_id] = str(project_path)
        data[project_id] = {
            "project_name": project_name,
            "project_path": str(project_path),
        }
        json.dump(data, f, indent=2)

    return read_project_path_storage(user_id)


def get_project_path(user_id: str, project_id: str) -> Path:
    data = read_project_path_storage(user_id)
    return Path(data[project_id]["project_path"])


def get_project_name(user_id: str, project_id: str) -> str:
    data = read_project_path_storage(user_id)
    return data[project_id]["project_name"]


def create_project(
    user_id: str, project_id: str, project_name: str, project_path: str = None
) -> Path:
    if project_path:
        server_path = project_path
        Path(server_path).mkdir(parents=True, exist_ok=True)
    else:
        server_path = make_project_path(user_id, project_id)
        server_path.mkdir(parents=True, exist_ok=True)

    # project_id => project_path
    _ = update_project_path_storage(
        user_id, project_id, project_name, project_path=server_path
    )
    return server_path


def delete_project(user_id: str, project_id: str) -> None:
    filepath = make_projects_json_path(user_id)
    data = read_project_path_storage(user_id)

    if project_id not in data:
        raise KeyError(f"Project {project_id} does not exist")

    with open(filepath, "w") as f:
        del data[project_id]
        json.dump(data, f)

    project_path = make_project_path(user_id, project_id)
    try:
        shutil.rmtree(project_path)
    except FileNotFoundError:
        pass


def get_project_files(user_id: str, project_id: str) -> ProjectFileTreeResponse:
    """
    Get the files in a project as a tree structure.

    Returns
    -------
    ProjectFileTreeResponse
        A tree structure of the files in a project.
    """
    project_path = get_project_path(user_id, project_id)
    project_name = get_project_name(user_id, project_id)

    if not project_path.exists():
        raise FileNotFoundError(f"Project {project_id} does not exist")

    contents = []
    for obj in project_path.rglob("*"):
        relpath = obj.relative_to(project_path)

        # Skip hidden files and directories
        if relpath.name.startswith(".") or obj.name.startswith("."):
            continue

        # files in subdirectories
        if obj.is_dir():
            contents.append(create_folder_entry(obj, project_path=project_path))
            continue

        # files at the project root
        if obj.parent.name == project_id:
            contents.append(create_file_entry(obj, project_path=project_path))
            continue

    return ProjectFileTreeResponse(
        id=project_id,
        name=project_name,
        path=str(project_path),
        contents=contents,
    )


def create_file_entry(path: Path, project_path: Path) -> FileEntry:
    return FileEntry(
        name=path.name,
        path=str(path.relative_to(project_path)),
        is_file=path.is_file(),
        is_folder=path.is_dir(),
        file_extension=path.suffix,
    )


def create_folder_entry(path: Path, project_path: Path) -> FolderEntry:
    children = []
    for obj in path.rglob("*"):
        if obj.is_file():
            children.append(create_file_entry(obj, project_path=project_path))
    return FolderEntry(
        name=path.name,
        path=str(path.relative_to(project_path)),
        is_file=path.is_file(),
        is_folder=path.is_dir(),
        children=children,
    )
