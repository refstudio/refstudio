from datetime import date
from typing import Any

from sidecar.typing import RefStudioModel, ResponseStatus

try:
    # introduced in Python 3.11 ...
    from enum import StrEnum
except ImportError:
    # ... but had some breaking changes
    # https://github.com/python/cpython/issues/100458
    # Python 3.10 and below
    from strenum import StrEnum


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


class ReferenceCreate(RefStudioModel):
    source_filename: str
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


class IngestRequestType(StrEnum):
    UPLOADS_DIRECTORY = "uploads"
    PDF = "pdf"
    GENERIC = "generic"


class IngestRequest(RefStudioModel):
    type: IngestRequestType


class IngestUploadsRequest(IngestRequest):
    type: IngestRequestType = IngestRequestType.UPLOADS_DIRECTORY
    pass


class IngestPdfUrlRequest(IngestRequest):
    type: IngestRequestType = IngestRequestType.PDF
    url: str
    metadata: ReferenceCreate


class IngestGenericRequest(IngestRequest):
    type: IngestRequestType = IngestRequestType.GENERIC
    metadata: ReferenceCreate


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
    message: str


ReferenceCreate.update_forward_refs()
Reference.update_forward_refs()
