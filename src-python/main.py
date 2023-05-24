import json
import sys
from argparse import ArgumentParser
from pathlib import Path

import grobid_tei_xml
from grobid_tei_xml.types import GrobidDocument


def parse_xml_file(filepath: Path) -> GrobidDocument:
    if filepath.suffix != ".xml":
        raise ValueError("Filepath must be a .xml file")

    with open(filepath, "r") as f:
        xml = f.read()
        doc = grobid_tei_xml.parse_document_xml(xml)
    return doc


def get_word_count(text: str) -> int:
    return len(text.strip().split(" "))


def main(text: str):
    try:
        data = {"num_words": get_word_count(text)}
        print(json.dumps(data))
    except Exception:
        print("Error processing text", file=sys.stderr)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--text", type=str)
    args = parser.parse_args()

    main(text=args.text)