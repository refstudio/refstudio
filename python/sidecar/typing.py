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
            for prop in schema.get("properties", {}).values():
                prop.pop("title", None)


class EmptyRequest(RefStudioModel):
    """Use this to indicate that a request only accepts an empty object ({})"""

    pass


class ResponseStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class CliCommands(RefStudioModel):
    # Imports need to happen here to avoid circular imports
    from sidecar.ai.schemas import (
        ChatRequest,
        ChatResponse,
        RewriteRequest,
        RewriteResponse,
        TextCompletionRequest,
        TextCompletionResponse,
    )
    from sidecar.references.schemas import (
        DeleteRequest,
        DeleteStatusResponse,
        IngestRequest,
        IngestResponse,
        IngestStatusResponse,
        ReferenceUpdate,
        UpdateStatusResponse,
    )
    from sidecar.search.schemas import SearchRequest, SearchResponse

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
