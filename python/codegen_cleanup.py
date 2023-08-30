"""Clean up some of the generated types."""

import re


def normalize_typename(typename: str):
    return typename.replace("_", "").lower()


if __name__ == "__main__":
    # Remove `components` from api-paths.ts
    # Create `components` in api-types.ts

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

    api_paths = open("src/api/api-paths.ts").read()
    component_schemas = set()
    for m in re.finditer(r"components\['schemas'\]\['([^']+)'\]", api_paths):
        component_schemas.add(m.group(1))

    used_types = set()
    for schema in component_schemas:
        api_typename = normname_to_api_name[normalize_typename(schema)]
        api_paths = api_paths.replace(
            f"components['schemas']['{schema}']",
            api_typename,
        )
        used_types.add(api_typename)

    api_paths = "import \{{','.join(used_types)}\} from './api-types';\n" + api_paths
    with open("src/api/api-paths.ts") as out:
        out.write(api_paths)
