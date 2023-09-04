from __future__ import annotations

from datetime import date
from typing import Any

from dotenv import load_dotenv
from pydantic import BaseModel
from sidecar.pydantic_utils import make_optional

try:
    # introduced in Python 3.11 ...
    from enum import StrEnum
except ImportError:
    # ... but had some breaking changes
    # https://github.com/python/cpython/issues/100458
    # Python 3.10 and below
    from strenum import StrEnum


load_dotenv()


class RefStudioModel(BaseModel):
    # This produces cleaner JSON Schema (and hence TypeScript types).
    # See https://github.com/refstudio/refstudio/pull/161 for more context.
    class Config:
        use_enum_values = True

        @staticmethod
        def schema_extra(schema: dict[str, Any]) -> None:
            for prop in schema.get("properties", {}).values():
                prop.pop("title", None)


class EmptyRequest(RefStudioModel):
    """Use this to indicate that a request only accepts an empty object ({})"""

    pass


class ResponseStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class IngestStatus(StrEnum):
    PROCESSING = "processing"
    FAILURE = "failure"
    COMPLETE = "complete"


class Reference(RefStudioModel):
    """A reference for an academic paper / PDF"""

    id: str
    source_filename: str
    status: IngestStatus
    citation_key: str | None = None
    doi: str | None = None
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
    reference_id: str
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
    reference_ids: list[str]
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
    temperature: float = 0.7


class ChatResponseChoice(TextSuggestionChoice):
    pass


class ChatResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    choices: list[ChatResponseChoice]


class SearchRequest(RefStudioModel):
    query: str
    limit: int = 10


class S2SearchResult(RefStudioModel):
    title: str | None = None
    abstract: str | None = None
    venue: str | None = None
    year: int | None = None
    paperId: str | None = None
    citationCount: int | None = None
    openAccessPdf: str | None = None
    authors: list[str] | None = None


class SearchResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    results: list[S2SearchResult]


class FileEntryBase(RefStudioModel):
    name: str
    path: str


class FileEntry(FileEntryBase):
    file_extension: str


class FolderEntry(FileEntryBase):
    children: list[FileEntry | FolderEntry] = []


class ProjectDetailsResponse(RefStudioModel):
    id: str
    name: str
    path: str


class ProjectFileTreeResponse(RefStudioModel):
    contents: list[FileEntry | FolderEntry]


class OpenAISettings(RefStudioModel):
    api_key: str = ""
    chat_model: str = "gpt-3.5-turbo"

    # TODO: the params below should not be settings
    # they should be configurable as part of the API request
    manner: RewriteMannerType = RewriteMannerType.SCHOLARLY
    temperature: float = 0.7


class ProjectCreateRequest(RefStudioModel):
    project_name: str
    """The name of the project"""
    project_path: str = None
    """
    The path to the project directory. Only necessary for Desktop.
    For web, the project is stored in a private directory on the server.
    """


class ProjectSettings(RefStudioModel):
    current_directory: str = ""


class LoggingSettings(RefStudioModel):
    enable: bool = False
    filepath: str = "/tmp/refstudio-sidecar.log"


class SidecarSettings(RefStudioModel):
    logging: LoggingSettings = LoggingSettings()


class SettingsSchema(RefStudioModel):
    """@deprecated"""

    project: ProjectSettings = ProjectSettings()
    openai: OpenAISettings = OpenAISettings()
    sidecar: SidecarSettings = SidecarSettings()


class FlatSettingsSchema(RefStudioModel):
    active_project_id: str
    current_directory: str
    logging_enabled: bool
    logging_filepath: str
    openai_api_key: str
    openai_chat_model: str
    openai_manner: RewriteMannerType
    openai_temperature: float


@make_optional()
class FlatSettingsSchemaPatch(FlatSettingsSchema):
    pass


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
    search: tuple[SearchRequest, SearchResponse]
    """Searches for papers on Semantic Scholar"""
    serve: tuple[None, None]
    """Start an HTTP server"""


Reference.update_forward_refs()
FolderEntry.update_forward_refs()
