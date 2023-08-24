from fastapi import FastAPI
from sidecar import http

api = FastAPI()
api.mount("/api/sidecar", http.sidecar_api)
api.mount("/api/fs", http.filesystem_api)
api.mount("/api/projects", http.project_api)
api.mount("/api/settings", http.settings_api)
