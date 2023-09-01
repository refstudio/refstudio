from fastapi import APIRouter
from sidecar.search import service
from sidecar.search.schemas import SearchRequest, SearchResponse

router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.post("/s2")
async def http_search_s2(req: SearchRequest) -> SearchResponse:
    response = service.search_s2(query=req.query, limit=req.limit)
    return response
