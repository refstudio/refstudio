from fastapi import FastAPI
from sidecar import http

api = FastAPI()
api.mount("/api/sidecar", http.sidecar_api)
