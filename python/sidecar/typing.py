from dataclasses import dataclass, field
from typing import Any

from dataclasses_jsonschema import JsonSchemaMixin


@dataclass
class Reference(JsonSchemaMixin):
    """A reference for an academic paper / PDF"""
    source_filename: str
    filename_md5: str
    title: str | None = None
    abstract: str | None = None
    contents: str | None = None
    authors: list["Author"] = field(default_factory=list)
    chunks: list["Chunk"] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Author(JsonSchemaMixin):
    full_name: str
    given_name: str
    surname: str
    email: str


@dataclass
class Chunk(JsonSchemaMixin):
    text: str
    vector: list[float] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class IngestResponse(JsonSchemaMixin):
    project_name: str
    references: list[Reference]


@dataclass
class RewriteChoice(JsonSchemaMixin):
    index: int
    text: str


@dataclass
class ChatResponseChoice(JsonSchemaMixin):
    index: int
    text: str


@dataclass
class CliCommands(JsonSchemaMixin):
    ingest: IngestResponse
    rewrite: list[RewriteChoice]
