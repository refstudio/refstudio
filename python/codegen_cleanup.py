"""Clean up some of the generated types from generate_schema.py.

After running that script in codegen.sh, we have two generated TS files:

- api-types.ts, which defines interfaces for all request/response types.
- api-paths.ts, which defines our full HTTP API, including all request/response types.

The types in api-types.ts are nicer to work with. This script patches api-paths.ts to
refer to the types in api-types.ts. This requires some normalization becuase json2ts
and openapi-typescript convert Python class names to TS types names a bit differently.
"""

import re


def normalize_typename(typename: str):
    return typename.replace("_", "").lower()


if __name__ == "__main__":
    # Pull out all the named types/interfaces in api-types.ts.
    # Not all of these will be used by api-paths.ts.
    api_type_lines = open("src/api/api-types.ts").readlines()
    api_types = []
    for line in api_type_lines:
        m = re.match(r"^export type ([^ =]+)\s+=", line)
        if m:
            api_types.append(m.group(1))
        m = re.match(r"^export interface ([^ =]+)\s\{", line)
        if m:
            api_types.append(m.group(1))

    normname_to_api_name = {
        normalize_typename(typename): typename for typename in api_types
    }

    # The types we want to update in api-paths.ts look like
    # components['schemas']['NameOfType']
    api_paths = open("src/api/api-paths.ts").read()
    component_schemas = set()
    for m in re.finditer(r"components\['schemas'\]\['([^']+)'\]", api_paths):
        component_schemas.add(m.group(1))

    # Update references in api-paths.ts, tracking the types we need to import.
    used_types = set()
    for schema in component_schemas:
        api_typename = normname_to_api_name[normalize_typename(schema)]
        api_paths = api_paths.replace(
            f"components['schemas']['{schema}']",
            api_typename,
        )
        used_types.add(api_typename)

    imports = "{" + ", ".join(sorted(used_types)) + "}"
    api_paths = (
        "/** You probably want to use the types from api-types.ts instead. */\n"
        + "/* eslint-disable */\n"
        + f"import {imports} from './api-types';\n\n"
        + api_paths
    )
    with open("src/api/api-paths.ts", "w") as out:
        out.write(api_paths)
