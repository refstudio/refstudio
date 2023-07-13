import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import List

import pypdf
from sidecar import settings

from .typing import Author, Chunk, Reference, TextCompletionChoice


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


def trim_completion_prefix_from_choices(
        prefix: str,
        choices: List[TextCompletionChoice]
    ) -> List[TextCompletionChoice]:
    """
    Trim a text completion prefix from a list of text completion choices.

    Parameters
    ----------
    prefix : str
        The prefix to trim from the text completion choices.
    choices : List[TextCompletionChoice]
        The text completion choices to trim the prefix from.

    Returns
    -------
    List[TextCompletionChoice]
        The text completion choices with the prefix trimmed.

    Examples
    --------
    >>> prefix = "This is a prefix and we have "
    >>> choices = [
    ...     TextCompletionChoice(index=0, text="This is a prefix and we have inserted some text."),
    ...     TextCompletionChoice(index=1, text="This is a prefix and we have added some text."),
    ...     TextCompletionChoice(index=2, text="updated some text."),
    ... ]
    >>> trimmed_choices = trim_completion_prefix_from_choices(prefix, choices)
    >>> trimmed_choices[0].text
    'inserted some text.'
    >>> trimmed_choices[1].text
    'added some text.'
    >>> trimmed_choices[2].text
    'updated some text.'
    """
    # split prefix into sentences
    sentence_splitter_regex = r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s'
    prefix_sentences = re.split(sentence_splitter_regex, prefix)

    # and remove any sentences from the prompt that were included in the responses
    for choice in choices:
        for sentence in prefix_sentences:
            if choice.text.strip().startswith(sentence.strip()):
                choice.text = choice.text[len(sentence):].strip()

            if '[MASK]' in choice.text:
                choice.text = choice.text.replace('[MASK]', '')
    return choices


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


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Chunk]:
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
                text=text[i:i + chunk_size],
            )
        )
    return chunks


def chunk_reference(
        ref: Reference,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
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
    filepath = Path(settings.UPLOADS_DIR).joinpath(ref.source_filename)
    try:
        reader = pypdf.PdfReader(filepath)
    except FileNotFoundError:
        return []

    chunks = []
    for page in reader.pages:
        page_text = page.extract_text()

        for i in range(0, len(page_text), chunk_size - chunk_overlap):
            chunk = Chunk(
                text=page_text[i:i + chunk_size],
                metadata={
                    'source_filename': ref.source_filename,
                    'title': ref.title,
                    # 'authors': ref.authors,
                    'page_num': page.page_number + 1
                },
            )
            chunks.append(chunk)
    return chunks


class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout
