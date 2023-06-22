from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel


class RefStudioModel(BaseModel):
    # This produces cleaner JSON Schema (and hence TypeScript types).
    # See https://github.com/refstudio/refstudio/pull/161 for more context.
    class Config:
        use_enum_values = True

        @staticmethod
        def schema_extra(schema: dict[str, Any], _model) -> None:
            for prop in schema.get('properties', {}).values():
                prop.pop('title', None)


class ResponseStatus(str, Enum):
    OK = "ok"
    ERROR = "error"


class IngestStatus(str, Enum):
    PROCESSING = "processing"
    FAILURE = "failure"
    COMPLETE = "complete"


class Reference(RefStudioModel):
    """A reference for an academic paper / PDF"""
    source_filename: str
    filename_md5: str
    status: IngestStatus = IngestStatus.PROCESSING
    citation_key: str | None = None
    title: str | None = None
    abstract: str | None = None
    contents: str | None = None
    published_date: date | None = None
    authors: list["Author"] = []
    chunks: list["Chunk"] = []
    metadata: dict[str, Any] = {}


class Author(RefStudioModel):
    full_name: str
    given_name: str | None = None
    surname: str | None = None
    email: str | None = None


class Chunk(RefStudioModel):
    text: str
    vector: list[float] = []
    metadata: dict[str, Any] = {}


class IngestResponse(RefStudioModel):
    project_name: str
    references: list[Reference]


class ReferenceStatus(RefStudioModel):
    source_filename: str
    status: IngestStatus


class IngestStatusResponse(RefStudioModel):
    status: ResponseStatus
    reference_statuses: list[ReferenceStatus]


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
