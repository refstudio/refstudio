from typing import Any

from pydantic import BaseModel


class Reference(BaseModel):
    """A reference for an academic paper / PDF"""
    source_filename: str
    filename_md5: str
    title: str | None = None
    abstract: str | None = None
    contents: str | None = None
    authors: list["Author"] = []
    chunks: list["Chunk"] = []
    metadata: dict[str, Any] = {}


class Author(BaseModel):
    full_name: str
    given_name: str
    surname: str
    email: str


class Chunk(BaseModel):
    text: str
    vector: list[float] = []
    metadata: dict[str, Any] = {}


class IngestResponse(BaseModel):
    project_name: str
    references: list[Reference]


class RewriteChoice(BaseModel):
    index: int
    text: str


class CliCommands(BaseModel):
    ingest: IngestResponse
    rewrite: list[RewriteChoice]


Reference.update_forward_refs()