import os
from pathlib import Path

import fsspec

from sidecar import settings


def get_project_path(user_id: str, project_id: str) -> Path:
    project_path = settings.WEB_STORAGE_URL / user_id / project_id
    return project_path


def create_project(user_id: str, project_id: str) -> Path:
    project_path = settings.WEB_STORAGE_URL / user_id / project_id
    project_path.mkdir(parents=True, exist_ok=True)
    return project_path


def get_project_files(user_id: str, project_id: str) -> list:
    project_path = settings.WEB_STORAGE_URL / user_id / project_id
    filepaths = list(project_path.glob("**/*"))
    return filepaths


def write_file(path: Path, content: str) -> None:
    with open(path, "w") as f:
        f.write(content)


def read_file(path: Path) -> str:
    with open(path, "r") as f:
        return f.read()


def delete_file(path: Path) -> None:
    os.remove(path)


def rename_file(path: Path, new_path: Path) -> None:
    os.rename(path, new_path)