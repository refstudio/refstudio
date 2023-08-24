"""Generate cli.schema.json, which contains return types for the subcommands."""
import json
import sys

from sidecar.typing import CliCommands

if __name__ == "__main__":
    cli_schema = json.loads(CliCommands.schema_json())
    json.dump(cli_schema, sys.stdout, indent=2)
