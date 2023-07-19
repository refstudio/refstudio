import inspect
from argparse import ArgumentParser

from sidecar.typing import CliCommands


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
        "ingest_status", description="Retrieve ingestion status of uploads"
    )

    ingest_references_parser = subparsers.add_parser(
        "ingest_references", description="Retrieve ingested PDF references"
    )
    ingest_references_parser.add_argument(
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

    update_parser = subparsers.add_parser(  # noqa: F481
        "update", description="Update metadata for a Reference"
    )
    update_parser.add_argument(
        "--data",
        type=str,
    )

    delete_parser = subparsers.add_parser("delete", description="Deletes a Reference")
    delete_parser.add_argument("--source_filenames", nargs="*", type=str)
    delete_parser.add_argument("--all", action="store_true")

    search_parser = subparsers.add_parser("search", description="Search for a paper")

    search_parser.add_argument(
        "--query",
        type=str,
        required=True,
        help="Search query for the Semantic Scholar search",
    )

    search_parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="Limit for the number of search results",
    )

    return parser
