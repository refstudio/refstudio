import uvicorn
from fastapi import FastAPI
from sidecar import http

# from sidecar.ai import router as ai_router
from sidecar.filesystem import router as filesystem_route
from sidecar.projects import router as projects_router
from sidecar.references import router as references_router
from sidecar.search import router as search_router
from sidecar.settings import router as settings_router

api = FastAPI()
api.mount("/api/meta", http.meta_api, name="meta")
# api.include_router(ai_router.router)
api.include_router(filesystem_route.router)
api.include_router(references_router.router)
api.include_router(projects_router.router)
api.include_router(search_router.router)
api.include_router(settings_router.router)


def serve(host: str, port: int):
    uvicorn.run(api, host=host, port=port, reload=False)
    uvicorn.run(api, host=host, port=port, reload=False)
