"""API for monitoring and controling the server"""
import os

import psutil
from fastapi import APIRouter

router = APIRouter(
    prefix="/meta",
    tags=["meta"],
)


@router.get("/status")
async def status():
    return {"status": "ok"}


@router.post("/shutdown")
async def shutdown():
    # See https://stackoverflow.com/a/74757349/388951
    parent_pid = os.getpid()
    parent = psutil.Process(parent_pid)
    for child in parent.children(recursive=True):
        child.kill()
    parent.kill()
