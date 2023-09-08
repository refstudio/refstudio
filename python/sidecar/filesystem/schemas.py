from sidecar.typing import RefStudioModel, ResponseStatus


class CreateFileResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    filepath: str | None = None


class DeleteFileResponse(RefStudioModel):
    status: ResponseStatus
    message: str
    filepath: str | None = None
