import os

import psutil
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

filesystem_api = FastAPI()  # API for interacting with the filesystem

meta_api = FastAPI()
"""API for monitoring and controling the server"""


@meta_api.get("/status")
async def status():
    return {"status": "ok"}


@meta_api.post("/shutdown")
async def shutdown():
    # See https://stackoverflow.com/a/74757349/388951
    parent_pid = os.getpid()
    parent = psutil.Process(parent_pid)
    for child in parent.children(recursive=True):
        child.kill()
    parent.kill()
