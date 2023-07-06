from argparse import ArgumentParser


def get_arg_parser():
    parser = ArgumentParser(description="CLI for Python sidecar")
    parser.add_argument(
        "--debug",
        action="store_true",
    )
    parser.add_argument(
        'subcommand',
        choices=[
            'ingest',
            'ingest_status',
            'rewrite',
            'chat',
            'update',
            'delete',
        ],
        required=True
    )
    parser.add_argument(
        'params_json',
        type=str,
        required=False,
    )
    return parser
