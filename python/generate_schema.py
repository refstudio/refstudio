"""Generate OpenAPI and JSONSchema for the HTTP API.

This generates two files:

1. openapi.json, which contains an OpenAPI spec for the entire HTTP API.
2. api.schema.json, which contains JSONSchema for the request/response types.
"""
import json

from fastapi.openapi.utils import get_openapi
from starlette.routing import Mount
from web import api

if __name__ == "__main__":
    combined_schemas = {}
    combined_paths = {}
    for route in api.routes:
        if not isinstance(route, Mount):
            continue  # must be a built-in route like /docs
        mount_path = route.path
        openapi = get_openapi(
            title=f"refstudio{mount_path}", version="0.1", routes=route.app.routes
        )
        components = openapi.get("components")
        if components:
            combined_schemas.update(components["schemas"])
        paths = openapi["paths"]
        for path, path_spec in paths.items():
            combined_paths[mount_path + path] = path_spec

    with open("python/openapi.json", "w") as out:
        json.dump(
            {
                "openapi": "3.1.0",
                "info": {
                    "title": "RefStudio API",
                    "version": "0.1",
                },
                "paths": combined_paths,
                "components": {"schemas": combined_schemas},
            },
            out,
            sort_keys=True,
            indent=2,
        )

    # OpenAPI puts request/response definitions under "/components/schemas", but
    # json2ts wants them under "/definitions".
    output_schema = json.dumps(combined_schemas)
    output_schema = output_schema.replace("#/components/schemas/", "#/definitions/")
    schema = json.loads(output_schema)
    with open("python/api.schema.json", "w") as out:
        json.dump({"definitions": schema}, out, indent=2)
