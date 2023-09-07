from sidecar.typing import RefStudioModel, ResponseStatus


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
