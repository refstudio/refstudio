"""Generate cli.schema.json, which contains return types for the subcommands."""
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
        )

    with open("src/api/api-types.ts", "w") as out:
        out.write("import {components} from './raw-api-types';\n")
        out.write("type schemas = components['schemas'];\n\n")
        for typename in sorted(combined_schemas.keys()):
            out.write(f"export type {typename} = schemas['{typename}'];\n")
