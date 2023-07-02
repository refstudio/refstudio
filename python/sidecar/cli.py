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

    ingest_status_parser = subparsers.add_parser(  # noqa: F841
        "ingest_status",
        description="Retrieve ingestion status of uploads"

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
    chat_parser.add_argument(
        "--n_choices",
        type=int,
        default=1,
    )

    update_parser = subparsers.add_parser(  # noqa: F481
        "update",
        description="Update metadata for a Reference"
    )
    update_parser.add_argument(
        "--data",
        type=str,
    )

    delete_parser = subparsers.add_parser(
        "delete",
        description="Deletes a Reference"
    )
    delete_parser.add_argument(
        "--source_filenames",
        nargs="*",
        type=str
    )
    delete_parser.add_argument(
        "--all",
        action="store_true"
    )
    return parser
