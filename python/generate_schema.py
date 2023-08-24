"""Generate cli.schema.json, which contains return types for the subcommands."""
import json

from fastapi.openapi.utils import get_openapi
from starlette.routing import Mount

from sidecar.typing import CliCommands
from web import api

if __name__ == '__main__':
    cli_schema = json.loads(CliCommands.schema_json())
    with open('python/cli.schema.json', 'w') as out:
        json.dump(cli_schema, out, indent=2)

    combined_schemas = {}
    for route in api.routes:
        if not isinstance(route, Mount):
            continue  # must be a built-in route like /docs
        mount_path = route.path
        openapi = get_openapi(title=f'refstudio{mount_path}', version='0.1', routes=route.app.routes)
        components = openapi.get('components')
        if components:
            combined_schemas.update(components['schemas'])

    # OpenAPI puts request/response definitions under "/components/schemas", but
    # json2ts wants them under "/definitions".
    output_schema = json.dumps(combined_schemas)
    output_schema = output_schema.replace('#/components/schemas/', '#/definitions/')
    schema = json.loads(output_schema)
    with open('python/api.schema.json', 'w') as out:
        json.dump({'definitions': schema}, out, indent=2)
