import inspect
from argparse import ArgumentParser

from python.sidecar.typing import CliCommands


def get_arg_parser():
    parser = ArgumentParser(description="CLI for Python sidecar")
    parser.add_argument(
        "--debug",
        action="store_true",
    )
    parser.add_argument(
        'command',
        # To add a new Sidecar command, add it to the CliCommands class.
        choices=[*inspect.signature(CliCommands).parameters.keys()],
    )
    parser.add_argument(
        'param_json',
        type=str,
        nargs='?',
        default='null',
        help='Command argument as JSON. Expected schema depends on the command.'
    )
    return parser
