from argparse import ArgumentParser


def get_arg_parser():
    parser = ArgumentParser(description="CLI for Python sidecar")
    parser.add_argument(
        "--debug",
        action="store_true",
    )
    subparsers = parser.add_subparsers(
        dest="command",
    )
    ingest_parser = subparsers.add_parser(
        "ingest",
        description="Ingest PDFs",
    )
    ingest_parser.add_argument(
        "--pdf_directory",
        type=str,
    )

    ai_parser = subparsers.add_parser(
        "rewrite",
        description="Rewrites a block of text in a more concise manner",
    )
    ai_parser.add_argument(
        "--text",
        type=str,
    )

    chat_parser = subparsers.add_parser(
        "chat",
        description="Chat with the AI",
    )
    chat_parser.add_argument(
        "--text",
        type=str,
    )
    return parser
