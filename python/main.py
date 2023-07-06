import inspect
import json

from sidecar import chat, cli, ingest, rewrite, storage

from python.sidecar.typing import CliCommands

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
        ingest.run_ingest(param_obj)

    if args.command == "ingest_status":
        ingest.get_statuses()

    if args.command == "ingest_references":
        ingest.get_references(param_obj)

    if args.command == "rewrite":
        rewrite.summarize(param_obj)

    if args.command == "chat":
        chat.ask_question(param_obj)

    if args.command == "update":
        storage.update_reference(param_obj)

    if args.command == "delete":
        storage.delete_references(param_obj)
