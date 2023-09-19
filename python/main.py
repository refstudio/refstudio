import inspect
import json
from argparse import ArgumentParser

from sidecar import config
from sidecar.typing import CliCommands


def get_arg_parser():
    parser = ArgumentParser(description="CLI for Python sidecar")
    parser.add_argument(
        "--debug",
        action="store_true",
    )
    parser.add_argument(
        "command",
        # To add a new Sidecar command, add it to the CliCommands class.
        choices=[*inspect.signature(CliCommands).parameters.keys()],
    )
    parser.add_argument(
        "param_json",
        type=str,
        nargs="?",
        default="null",
        help="Command argument as JSON. Expected schema depends on the command.",
    )
    return parser


if __name__ == "__main__":
    parser = get_arg_parser()
    args = parser.parse_args()

    if args.debug:
        print(args)

    param_json = json.loads(args.param_json)
    args_type = (
        inspect.signature(CliCommands).parameters[args.command].annotation.__args__[0]
    )

    if args_type is None:
        if param_json is not None:
            raise ValueError(f"Command {args.command} does not take an argument")
        param_obj = None
    else:
        param_obj = args_type.parse_obj(param_json)

    if args.command == "serve":
        from sidecar.api import serve

        serve(host=config.HOST, port=config.PORT)

    else:
        raise NotImplementedError(f"Command {args.command} is not implemented.")
