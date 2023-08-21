import os
from pathlib import Path

import fsspec


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