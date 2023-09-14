import json
import shutil
from pathlib import Path

from sidecar.config import WEB_STORAGE_URL
from sidecar.filesystem.service import traverse_directory
from sidecar.projects.schemas import Project, ProjectFileTreeResponse, ProjectStore

# Ensure that the server's path storage directory exists.
Path(WEB_STORAGE_URL).mkdir(parents=True, exist_ok=True)


def make_projects_json_path(user_id: str) -> Path:
    """
    Returns the path to the JSON file that stores the mapping of project ids to
    project details.
    """
    filepath = Path(WEB_STORAGE_URL / user_id / "projects.json")
    return filepath


def make_project_path(user_id: str, project_id: str) -> Path:
    """
    Returns the path to the project directory for a given user and project id.
    """
    filepath = Path(WEB_STORAGE_URL / user_id / project_id)
    return filepath


def initialize_projects_json_storage(user_id: str) -> None:
    """
    Creates the JSON file that stores the mapping of project ids to project
    details.
    """
    filepath = make_projects_json_path(user_id)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w") as f:
        json.dump({}, f)


def read_project_storage(user_id: str) -> ProjectStore:
    """
    Reads the JSON file that stores the mapping of project ids to project
    details.

    Returns
    -------
    ProjectStore
    """
    filepath = make_projects_json_path(user_id)

    if not filepath.exists():
        initialize_projects_json_storage(user_id)

    with open(filepath, "r") as f:
        data = json.load(f)
    return ProjectStore(projects=data)


def get_projects_for_user(user_id: str) -> list[Project]:
    """
    Returns a list of projects for the current user
    """
    project_store = read_project_storage(user_id)
    return list(project_store.projects.values())


def update_project_storage(
    user_id: str, project_id: str, project_name: str, project_path: str
) -> ProjectStore:
    """
    Updates the path storage file, which is responsible for mapping a project id
    to the corresponding filepath for storing project files.
    """
    filepath = make_projects_json_path(user_id)

    if not filepath.exists():
        initialize_projects_json_storage(user_id)

    stored_projects = read_project_storage(user_id)
    data = stored_projects.dict().get("projects")

    with open(filepath, "w") as f:
        data[project_id] = {
            "id": project_id,
            "name": project_name,
            "path": str(project_path),
        }
        json.dump(data, f)

    return read_project_storage(user_id)


def get_project(user_id: str, project_id: str) -> Project:
    project_store = read_project_storage(user_id)
    project = project_store.projects[project_id]
    return project


def get_project_path(user_id: str, project_id: str) -> Path:
    project_store = read_project_storage(user_id)
    project = project_store.projects[project_id]
    return Path(project.path)


def get_project_staging_path(user_id: str, project_id: str) -> Path:
    project_path = get_project_path(user_id, project_id)
    return project_path / ".staging"


def create_project_staging_filepath(
    user_id: str, project_id: str, filename: str
) -> Path:
    project_path = get_project_staging_path(user_id, project_id)
    return project_path / filename


def get_project_uploads_path(user_id: str, project_id: str) -> Path:
    project_path = get_project_path(user_id, project_id)
    return project_path / "uploads"


def create_project_uploads_filepath(
    user_id: str, project_id: str, filename: str
) -> Path:
    project_path = get_project_uploads_path(user_id, project_id)
    return project_path / filename


def get_project_exports_path(user_id: str, project_id: str) -> Path:
    project_path = get_project_path(user_id, project_id)
    return project_path / "exports"


def get_project_name(user_id: str, project_id: str) -> str:
    stored_projects = read_project_storage(user_id)
    project = stored_projects.projects[project_id]
    return project.name


def create_project(
    user_id: str, project_id: str, project_name: str, project_path: str = None
) -> Project:
    if project_path:
        server_path = project_path
        Path(server_path).mkdir(parents=True, exist_ok=True)
    else:
        server_path = make_project_path(user_id, project_id)
        server_path.mkdir(parents=True, exist_ok=True)

    update_project_storage(user_id, project_id, project_name, project_path=server_path)
    return Project(
        id=project_id,
        name=project_name,
        path=str(server_path),
    )


def delete_project(user_id: str, project_id: str) -> None:
    filepath = make_projects_json_path(user_id)
    project_store = read_project_storage(user_id)
    data = project_store.dict().get("projects", {})

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

    if not project_path.exists():
        raise FileNotFoundError(f"Project {project_id} does not exist")

    contents = traverse_directory(
        project_path, relative_to=project_path, ignore_hidden=True
    )
    return ProjectFileTreeResponse(
        contents=contents,
    )
