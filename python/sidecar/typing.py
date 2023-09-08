from typing import Any

from pydantic import BaseModel

try:
    # introduced in Python 3.11 ...
    from enum import StrEnum
except ImportError:
    # ... but had some breaking changes
    # https://github.com/python/cpython/issues/100458
    # Python 3.10 and below
    from strenum import StrEnum


class RefStudioModel(BaseModel):
    # This produces cleaner JSON Schema (and hence TypeScript types).
    # See https://github.com/refstudio/refstudio/pull/161 for more context.
    class Config:
        use_enum_values = True

        @staticmethod
        def schema_extra(schema: dict[str, Any]) -> None:
            for prop in schema.get("properties", {}).values():
                prop.pop("title", None)


class EmptyRequest(RefStudioModel):
    """Use this to indicate that a request only accepts an empty object ({})"""

    pass


class ResponseStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class StatusResponse(RefStudioModel):
    status: ResponseStatus


class CliCommands(RefStudioModel):
    serve: tuple[None, None]
    """Start an HTTP server"""
