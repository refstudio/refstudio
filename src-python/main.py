import json
import sys
from argparse import ArgumentParser

from sidecar import ingest


def get_word_count(text: str) -> int:
    return len(text.strip().split(" "))

def main(text: str):
    try:
        data = {"num_words": get_word_count(text)}
        print(json.dumps(data))
    except Exception:
        print("Error processing text", file=sys.stderr)


if __name__ == '__main__':
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
        "ai",
        description="AI operations",
    )
    ai_parser.add_argument(
        "--text",
        type=str,
    )

    args = parser.parse_args()

    if args.debug:
        print(args)
    if args.command == "ingest":
        ingest.main(args.pdf_directory)
    if args.command == "ai":
        main(text=args.text)
