import uvicorn
from fastapi import FastAPI
from sidecar.ai import router as ai_router
from sidecar.filesystem import router as filesystem_route
from sidecar.meta import router as meta_router
from sidecar.projects import router as projects_router
from sidecar.references import router as references_router
from sidecar.search import router as search_router
from sidecar.settings import router as settings_router

api = FastAPI(title="RefStudio API", version="0.1")
api.include_router(meta_router.router)
api.include_router(ai_router.router)
api.include_router(filesystem_route.router)
api.include_router(references_router.router)
api.include_router(projects_router.router)
api.include_router(search_router.router)
api.include_router(settings_router.router)


def serve(host: str, port: int):
    uvicorn.run(api, host=host, port=port, reload=False)
