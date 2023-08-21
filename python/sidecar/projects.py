from pathlib import Path
import json
import shutil

from sidecar import settings


def update_project_path_storage(user_id: str, project_id: str, project_path: str) -> dict[str, str]:
    """
    Updates the path storage file, which is responsible for mapping a project id
    to the corresponding filepath for storing project files.
    """
    filepath = settings.WEB_STORAGE_URL / f"projects_{user_id}.json"

    if not Path(filepath).exists():
        with open(filepath, "w") as f:
            json.dump({}, f)

    data = read_project_path_storage(user_id)

    with open(filepath, "w") as f:
        data[project_id] = str(project_path)
        json.dump(data, f)
    
    return read_project_path_storage(user_id)


def read_project_path_storage(user_id: str) -> dict[str, str]:
    filepath = settings.WEB_STORAGE_URL / f"projects_{user_id}.json"

    if not Path(filepath).exists():
        with open(filepath, "w") as f:
            json.dump({}, f)

    with open(filepath, "r") as f:
        data = json.load(f)
    return data


def get_project_path(user_id: str, project_id: str) -> Path:
    data = read_project_path_storage(user_id)
    return data[project_id]


def create_project(user_id: str, project_id: str, project_path: str = None) -> Path:
    if project_path:
        server_path = project_path
    else:
        server_path = settings.WEB_STORAGE_URL / user_id / project_id
        server_path.mkdir(parents=True, exist_ok=True)

    # project_id => project_path
    project_storage_mappings = update_project_path_storage(
        user_id,
        project_id,
        project_path=server_path
    )
    return server_path 


def delete_project(user_id: str, project_id: str) -> None:
    filepath = settings.WEB_STORAGE_URL / f"projects_{user_id}.json"
    data = read_project_path_storage(user_id)

    with open(filepath, "w") as f:
        del data[project_id]
        json.dump(data, f)
    
    project_path = settings.WEB_STORAGE_URL / user_id / project_id
    try:
        shutil.rmtree(project_path)
    except FileNotFoundError:
        pass


def get_project_files(user_id: str, project_id: str) -> list:
    project_path = settings.WEB_STORAGE_URL / user_id / project_id
    filepaths = list(project_path.glob("**/*"))
    return filepaths