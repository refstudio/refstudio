import os
import sys
from datetime import datetime
from typing import List

from .typing import Author, Chunk, Reference


def get_word_count(text: str) -> int:
    return len(text.strip().split(" "))


def remove_file(filepath: str) -> None:
    """
    Removes a file located at `filepath`.
    """
    try:
        os.remove(filepath)
    except OSError:
        pass


def parse_date(date_str: str) -> datetime:
    """
    Parse a YYYY-mm-dd date string into a datetime object.
    Grobid used ISO 8601 format: https://grobid.readthedocs.io/en/latest/training/date/
    :param date_str: str
    :return: datetime
    """
    # Since Grobid returns dates in ISO 8601 YYYY-mm-dd format,
    # this function only needs to support that format for now, but ...
    # TODO: support more date formats
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def get_first_author_surname(authors: List[Author]) -> str:
    """
    Get the surname of the first author in a list of authors
    :param authors: List[Author]
    :return: str
    """
    if not authors:
        return None
    
    author = authors[0]
    if author.surname:
        return author.surname
    elif author.full_name and " " in author.full_name:
        return author.full_name.split(" ")[-1]
    return None


def create_citation_key(ref: Reference) -> str:
    """
    Creates a citation key for a given Reference.
    Refstudio citation keys use Pandoc markdown syntax, e.g. [smith2019]
    :param ref: Reference
    :return: str
    """
    if not ref.authors and not ref.published_date:
        return "untitled"
    
    if not ref.authors and ref.published_date:
        return f"untitled{ref.published_date.year}"

    surname = get_first_author_surname(ref.authors).strip()
    if ref.authors and ref.published_date:
        key = f"{surname}{ref.published_date.year}"
    elif ref.authors and not ref.published_date:
        key = f"{surname}"
    else:
        key = "untitled"
    return key.lower()


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Chunk]:
    """
    Chunk text into smaller pieces for embedding
    :param text:
    :param chunk_size:
    :param chunk_overlap:
    :return:
    """
    if not text:
        return []

    if len(text) < chunk_size:
        return [Chunk(text=text)]

    chunks = []
    for i in range(0, len(text), chunk_size - chunk_overlap):
        chunks.append(
            Chunk(
                text=text[i:i + chunk_size],
            )
        )
    return chunks


class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout
