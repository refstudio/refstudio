"""Generate cli.schema.json, which contains return types for the subcommands."""
import json
import sys

from sidecar import cli
from sidecar.typing import CliCommands

if __name__ == '__main__':
    parser = cli.get_arg_parser()
    commands = [*parser._get_positional_actions()[0].choices.keys()]
    cli_schema = json.loads(CliCommands.schema_json())

    # There needs to be a 1-1 match between subcommands and CliCommands properties.
    subcommands = set(commands)
    schema_commands = set(cli_schema['required'])
    assert subcommands == schema_commands, (
        f'ArgumentParser subcommands {subcommands} != {schema_commands} in CliCommands'
    )

    json.dump(cli_schema, sys.stdout, indent=2)
