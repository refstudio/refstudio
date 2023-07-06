from argparse import ArgumentParser


def get_arg_parser():
    parser = ArgumentParser(description="CLI for Python sidecar")
    parser.add_argument(
        "--debug",
        action="store_true",
    )
    parser.add_argument(
        'command',
        choices=[
            'ingest',
            'ingest_status',
            'rewrite',
            'chat',
            'update',
            'delete',
        ],
    )
    parser.add_argument(
        'param_json',
        type=str,
        nargs='?',
        default='null'
    )
    return parser
