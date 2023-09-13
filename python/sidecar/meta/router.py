"""API for monitoring and controling the server"""
import os

import psutil
from fastapi import APIRouter
from sidecar.typing import ResponseStatus, StatusResponse

router = APIRouter(
    prefix="/meta",
    tags=["meta"],
)


@router.get("/status")
async def status() -> StatusResponse:
    return StatusResponse(status=ResponseStatus.OK)


@router.post("/shutdown")
async def shutdown() -> None:
    # See https://stackoverflow.com/a/74757349/388951
    parent_pid = os.getpid()
    parent = psutil.Process(parent_pid)
    for child in parent.children(recursive=True):
        child.kill()
    parent.kill()
