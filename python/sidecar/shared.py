import os
import sys
from datetime import date, datetime
from pathlib import Path
from typing import List, Union

import pypdf

from sidecar import config
from sidecar.config import logger
from sidecar.references.schemas import Author, Chunk, Reference, ReferenceCreate

logger = logger.getChild(__name__)


def clean_filename(filename: str) -> str:
    """
    Cleans a filename by removing special characters

    Parameters
    ----------
    filename : str
        Filename to clean

    Returns
    -------
    str
        Cleaned filename
    """
    return "".join(c for c in filename if c.isalnum() or c in "_- ").strip()


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
    if isinstance(date_str, date):
        return date_str
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


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract raw text from a PDF file

    Parameters
    ----------
    pdf_path : str
        Path to PDF file

    Returns
    -------
    str
        Raw text extracted from PDF
    """
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text


def chunk_text(
    text: str, chunk_size: int = 1000, chunk_overlap: int = 200
) -> List[Chunk]:
    """
    Chunk text into smaller pieces for embedding

    Parameters
    ----------
    text : str
        Text to chunk
    chunk_size : int, optional
        Size of each chunk, by default 1000
    chunk_overlap : int, optional
        Number of characters to overlap between chunks, by default 200

    Returns
    -------
    List[Chunk]
    """
    if not text:
        return []

    if len(text) < chunk_size:
        return [Chunk(text=text)]

    chunks = []
    for i in range(0, len(text), chunk_size - chunk_overlap):
        chunks.append(
            Chunk(
                text=text[i : i + chunk_size],
            )
        )
    return chunks


def chunk_reference(
    ref: Union[Reference, ReferenceCreate],
    filepath: Path = None,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> List[Chunk]:
    """
    Chunks a Reference document into small pieces of overlapping text

    Parameters
    ----------
    ref: Reference
        Reference to chunk
    chunk_size : int, optional
        Size of each chunk, by default 1000
    chunk_overlap : int, optional
        Number of characters to overlap between chunks, by default 200

    Returns
    -------
    List[Chunk]
    """
    if not filepath:
        filepath = Path(config.UPLOADS_DIR).joinpath(ref.source_filename)

    try:
        reader = pypdf.PdfReader(str(filepath))
    except FileNotFoundError:
        logger.error(f"File not found: {filepath}")
        return []

    chunks = []
    for page in reader.pages:
        page_text = page.extract_text()

        for i in range(0, len(page_text), chunk_size - chunk_overlap):
            chunk = Chunk(
                text=page_text[i : i + chunk_size],
                metadata={
                    "source_filename": ref.source_filename,
                    "title": ref.title,
                    # 'authors': ref.authors,
                    "page_num": page.page_number + 1,
                },
            )
            chunks.append(chunk)
    return chunks


class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, "w")

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout
