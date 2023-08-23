import inspect
import json
import sys

from sidecar import chat, cli, ingest, rewrite, search, storage
from sidecar.typing import CliCommands

if __name__ == '__main__':
    parser = cli.get_arg_parser()
    args = parser.parse_args()

    if args.debug:
        print(args)

    param_json = json.loads(args.param_json)
    args_type = inspect.signature(CliCommands).parameters[args.command].annotation.__args__[0]

    if args_type is None:
        if param_json is not None:
            raise ValueError(f'Command {args.command} does not take an argument')
        param_obj = None
    else:
        param_obj = args_type.parse_obj(param_json)

    if args.command == "ingest":
        response = ingest.run_ingest(param_obj)
        sys.stdout.write(response.json())

    elif args.command == "ingest_status":
        response = ingest.get_statuses()
        sys.stdout.write(response.json())

    elif args.command == "ingest_references":
        response = ingest.get_references(param_obj)
        sys.stdout.write(response.json())

    elif args.command == "rewrite":
        response = rewrite.rewrite(param_obj)
        sys.stdout.write(response.json())

    elif args.command == "completion":
        response = rewrite.complete_text(param_obj)
        sys.stdout.write(response.json())

    elif args.command == "chat":
        response = chat.ask_question(param_obj)
        sys.stdout.write(response.json())

    elif args.command == "update":
        response = storage.update_reference(param_obj)
        sys.stdout.write(response.json())

    elif args.command == "delete":
        response = storage.delete_references(param_obj)
        sys.stdout.write(response.json())

    elif args.command == "search":
        response = search.search_s2(param_obj)
        sys.stdout.write(response.json())
    
    elif args.command == "link_references":
        response = storage.link_references(param_obj)
        sys.stdout.write(response.json())

    else:
        raise NotImplementedError(f"Command {args.command} is not implemented.")
