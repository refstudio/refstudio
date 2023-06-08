from dataclasses import dataclass, field
from typing import Any


@dataclass
class Reference:
    source_filename: str
    filename_md5: str
    title: str | None = None
    abstract: str | None = None
    contents: str | None = None
    authors: list["Author"] = field(default_factory=list)
    chunks: list["Chunk"] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Affiliation:
    institution: str
    department: str


@dataclass
class Author:
    full_name: str
    given_name: str
    surname: str
    email: str


@dataclass
class Chunk:
    text: str
    vector: list[float] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
