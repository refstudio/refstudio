"""Generate OpenAPI and JSONSchema for the HTTP API.

This generates two files:

1. openapi.json, which contains an OpenAPI spec for the entire HTTP API.
2. api.schema.json, which contains JSONSchema for the request/response types.
"""
import json
from pathlib import Path

from fastapi import FastAPI
from sidecar.api import api


def create_openapi_schema(app: FastAPI):
    return app.openapi()


def create_json_schema(app: FastAPI):
    """
    Create a JSONSchema for the request/response types. This is used by
    json2ts to generate TypeScript types.

    Notes
    -----
    OpenAPI puts request/response definitions under "/components/schemas", but
    json2ts wants them under "/definitions".
    """
    openapi = app.openapi()
    output_schema = json.dumps(openapi["components"]["schemas"], indent=2)
    output_schema = output_schema.replace("#/components/schemas/", "#/definitions/")
    return json.loads(output_schema)


if __name__ == "__main__":
    openapi_schema = create_openapi_schema(api)

    filepath = Path(__file__).parent / "openapi.json"
    with open(filepath, "w") as out:
        json.dump(openapi_schema, out, sort_keys=True, indent=2)

    json_schema = create_json_schema(api)

    filepath = Path(__file__).parent / "api.schema.json"
    with open(filepath, "w") as out:
        json.dump({"definitions": json_schema}, out, indent=2)
