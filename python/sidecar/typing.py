from typing import Any

from pydantic import BaseModel


class RefStudioModel(BaseModel):
    class Config:
        @staticmethod
        def schema_extra(schema: dict[str, Any], _model) -> None:
            for prop in schema.get('properties', {}).values():
                prop.pop('title', None)


class Reference(RefStudioModel):
    """A reference for an academic paper / PDF"""
    source_filename: str
    filename_md5: str
    title: str | None = None
    abstract: str | None = None
    contents: str | None = None
    authors: list["Author"] = []
    chunks: list["Chunk"] = []
    metadata: dict[str, Any] = {}


class Author(RefStudioModel):
    full_name: str
    given_name: str
    surname: str
    email: str


class Chunk(RefStudioModel):
    text: str
    vector: list[float] = []
    metadata: dict[str, Any] = {}


class IngestResponse(RefStudioModel):
    project_name: str
    references: list[Reference]


class RewriteChoice(RefStudioModel):
    index: int
    text: str


class ChatResponseChoice(RefStudioModel):
    index: int
    text: str


class CliCommands(RefStudioModel):
    ingest: IngestResponse
    rewrite: list[RewriteChoice]
    chat: list[ChatResponseChoice]


Reference.update_forward_refs()
