import uvicorn
from fastapi import FastAPI

from sidecar import http


api = FastAPI()
api.mount("/api/sidecar", http.sidecar_api)
api.mount("/api/fs", http.filesystem_api)
api.mount("/api/projects", http.project_api)
api.mount("/api/meta", http.meta_api)


def serve(host: str, port: int):
    uvicorn.run(api, host=host, port=port, reload=False)
