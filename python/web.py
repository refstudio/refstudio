import uvicorn
from fastapi import FastAPI
from sidecar import http

api = FastAPI()
api.mount("/api/references", http.references_api, name="references")
api.mount("/api/ai", http.ai_api, name="ai")
api.mount("/api/search", http.search_api, name="search")
api.mount("/api/fs", http.filesystem_api, name="filesystem")
api.mount("/api/projects", http.project_api, name="projects")
api.mount("/api/meta", http.meta_api, name="meta")
api.mount("/api/settings", http.settings_api, name="settings")


def serve(host: str, port: int):
    uvicorn.run(api, host=host, port=port, reload=False)
