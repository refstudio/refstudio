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
    status: IngestStatus
    citation_key: str | None = None
    title: str | None = None
    abstract: str | None = None
    contents: str | None = None
    published_date: date | None = None
    authors: list["Author"] = []
    chunks: list["Chunk"] = []
    metadata: dict[str, Any] = {}


class ReferencePatch(RefStudioModel):
    """
    ReferencePatch is the input type for updating a Reference's metadata.
    """
    data: dict[str, Any]


class ReferenceUpdate(RefStudioModel):
    source_filename: str
    patch: ReferencePatch


class ReferenceDelete(RefStudioModel):
    source_filenames: list[str]


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


class IngestRequest(RefStudioModel):
    pdf_directory: str


class IngestStatusResponse(RefStudioModel):
    status: ResponseStatus
    reference_statuses: list[ReferenceStatus]


class UpdateStatusResponse(RefStudioModel):
    status: ResponseStatus
    message: str


class DeleteRequest(RefStudioModel):
    source_filenames: list[str]
    all: bool = False


class DeleteStatusResponse(RefStudioModel):
    status: ResponseStatus
    message: str


class RewriteRequest(RefStudioModel):
    text: str
    n_choices: int = 1
    temperature: float = 0.7


class RewriteChoice(RefStudioModel):
    index: int
    text: str


class TextCompletionRequest(RefStudioModel):
    text: str
    n_choices: int = 1
    temperature: float = 0.7
    max_tokens: int = 512
    title: str = None
    abstract: str = None


class ChatRequest(RefStudioModel):
    text: str
    n_choices: int = 1


class ChatResponseChoice(RefStudioModel):
    index: int
    text: str


class CliCommands(RefStudioModel):
    ingest: tuple[IngestRequest, IngestResponse]
    """Ingest PDFs"""
    ingest_status: tuple[None, IngestStatusResponse]
    """Retrieve ingestion status of uploads"""
    ingest_references: tuple[IngestRequest, IngestResponse]
    """Retrieve ingested PDF references"""
    rewrite: tuple[RewriteRequest, list[RewriteChoice]]
    """"Rewrites a block of text in a more concise manner"""
    complete_text: tuple[TextCompletionRequest, list[RewriteChoice]]
    """Completes a body of text"""
    chat: tuple[ChatRequest, list[ChatResponseChoice]]
    """Chat with the AI"""
    update: tuple[ReferenceUpdate, UpdateStatusResponse]
    """Update metadata for a Reference"""
    delete: tuple[DeleteRequest, DeleteStatusResponse]
    """Deletes a Reference"""


Reference.update_forward_refs()
