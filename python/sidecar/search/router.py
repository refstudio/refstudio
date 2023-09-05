from fastapi import APIRouter
from sidecar.search import service
from sidecar.search.schemas import SearchResponse

router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.get("/s2")
async def http_search_s2(query: str, limit: int = 10) -> SearchResponse:
    response = service.search_s2(query=query, limit=limit)
    return response
