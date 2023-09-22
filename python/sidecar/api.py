import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sidecar.ai import router as ai_router
from sidecar.filesystem import router as filesystem_route
from sidecar.meta import router as meta_router
from sidecar.projects import router as projects_router
from sidecar.references import router as references_router
from sidecar.search import router as search_router
from sidecar.settings import router as settings_router

api = FastAPI(title="RefStudio API", version="0.1")
api.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # This for the dev server
        "http://localhost:1420",
        # This for the tauri desktop app (release build)
        "tauri://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api.include_router(meta_router.router, prefix="/api")
api.include_router(ai_router.router, prefix="/api")
api.include_router(filesystem_route.router, prefix="/api")
api.include_router(references_router.router, prefix="/api")
api.include_router(projects_router.router, prefix="/api")
api.include_router(search_router.router, prefix="/api")
api.include_router(settings_router.router, prefix="/api")


def serve(host: str, port: int):
    uvicorn.run(api, host=host, port=port, reload=False)
