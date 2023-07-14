from datetime import date
from typing import Any

from pydantic import BaseModel

try:
    # introduced in Python 3.11 ... 
    from enum import StrEnum
except ImportError:
    # ... but had some breaking changes
    # https://github.com/python/cpython/issues/100458
    # Python 3.10 and below
    from strenum import StrEnum


class RefStudioModel(BaseModel):
    # This produces cleaner JSON Schema (and hence TypeScript types).
    # See https://github.com/refstudio/refstudio/pull/161 for more context.
    class Config:
        use_enum_values = True

        @staticmethod
        def schema_extra(schema: dict[str, Any]) -> None:
            for prop in schema.get('properties', {}).values():
                prop.pop('title', None)


class ResponseStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class IngestStatus(StrEnum):
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


class TextSuggestionChoice(RefStudioModel):
    index: int
    text: str


class RewriteMannerType(StrEnum):
    CONCISE = "concise"
    ELABORATE = "elaborate"
    SCHOLARLY = "scholarly"


class RewriteRequest(RefStudioModel):
    text: str
    manner: RewriteMannerType = RewriteMannerType.CONCISE
    n_choices: int = 1
    temperature: float = 0.7


class RewriteChoice(TextSuggestionChoice):
    pass


class RewriteResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    choices: list[RewriteChoice]


class TextCompletionRequest(RefStudioModel):
    text: str
    n_choices: int = 1
    temperature: float = 0.7
    max_tokens: int = 512
    title: str = None
    abstract: str = None


class TextCompletionChoice(TextSuggestionChoice):
    pass


class TextCompletionResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    choices: list[TextCompletionChoice]


class ChatRequest(RefStudioModel):
    text: str
    n_choices: int = 1


class ChatResponseChoice(TextSuggestionChoice):
    pass


class ChatResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    choices: list[ChatResponseChoice]


class CliCommands(RefStudioModel):
    ingest: tuple[IngestRequest, IngestResponse]
    """Ingest PDFs"""
    ingest_status: tuple[None, IngestStatusResponse]
    """Retrieve ingestion status of uploads"""
    ingest_references: tuple[IngestRequest, IngestResponse]
    """Retrieve ingested PDF references"""
    rewrite: tuple[RewriteRequest, RewriteResponse]
    """"Rewrites a block of text in a specified manner"""
    completion: tuple[TextCompletionRequest, TextCompletionResponse]
    """Completes a body of text"""
    chat: tuple[ChatRequest, ChatResponse]
    """Chat with the AI"""
    update: tuple[ReferenceUpdate, UpdateStatusResponse]
    """Update metadata for a Reference"""
    delete: tuple[DeleteRequest, DeleteStatusResponse]
    """Deletes a Reference"""


Reference.update_forward_refs()
