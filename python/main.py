import inspect
import json

from sidecar import cli
from sidecar.typing import CliCommands

if __name__ == "__main__":
    parser = cli.get_arg_parser()
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
        from web import serve

        serve(host="0.0.0.0", port=1487)

    else:
        raise NotImplementedError(f"Command {args.command} is not implemented.")
