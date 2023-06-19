from datetime import date, datetime

from sidecar import shared
from sidecar.typing import Author, Reference


def test_get_word_count():
    assert shared.get_word_count("Hello World") == 2


def test_parse_date():
    # Grobid returns dates in ISO 8601 YYYY-mm-dd format
    # so this is all this function needs to support for now
    assert shared.parse_date("2019-01-01") == date(2019, 1, 1)
    assert shared.parse_date("abc") is None


def test_get_filename_md5():
    assert shared.get_filename_md5("test.pdf") == "754dc77d28e62763c4916970d595a10f"


def test_get_first_author_surname():
    a = [
        Author(full_name="Dan Vanderkam", given_name="Dan", surname="Vanderkam"),
        Author(full_name="Jeff Hammerbacher", given_name="Jeff", surname="Hammerbacher"),
    ]
    assert shared.get_first_author_surname(a) == "Vanderkam"

    b = [Author(full_name="Jeff Hammerbacher", given_name="Jeff", surname="Hammerbacher")]
    assert shared.get_first_author_surname(b) == "Hammerbacher"

    c = [Author(full_name="Jeff Hammerbacher", given_name="Jeff")]
    assert shared.get_first_author_surname(c) == "Hammerbacher"

    d = [Author(full_name="Jeff")]
    assert shared.get_first_author_surname(d) is None


def test_create_citation_key():
    test_data = [
        {
            "source_filename": "abc.pdf",
            "filename_md5": "some_md5",
            "authors": [
                Author(full_name="Dan Vanderkam", given_name="Dan", surname="Vanderkam"),
                Author(full_name="Jeff Hammerbacher", given_name="Jeff", surname="Hammerbacher"),
            ],
            "published_date": datetime(2016, 1, 1),
            "title": "pileup.js: a JavaScript library for interactive and in-browser visualization of genomic data"
        },
        {
            "source_filename": "abc.pdf",
            "filename_md5": "some_md5",
            "authors": [
                Author(full_name="Jeff Hammerbacher", given_name="Jeff", surname="Hammerbacher")
            ],
            "published_date": None,
        },
        {
            "source_filename": "abc.pdf",
            "filename_md5": "some_md5",
            "authors": [],
            "published_date": None,
        },
        {
            "source_filename": "abc.pdf",
            "filename_md5": "some_md5",
            "authors": [],
            "published_date": date(2020, 1, 1),
        },
    ]
    references = [Reference(**data) for data in test_data]
    assert shared.create_citation_key(references[0]) == "vanderkam2016"
    assert shared.create_citation_key(references[1]) == "hammerbacher"
    assert shared.create_citation_key(references[2]) == "untitled"
    assert shared.create_citation_key(references[3]) == "untitled2020"


def test_chunk_text():
    # empty text should return empty list
    chunks = shared.chunk_text("")
    assert len(chunks) == 0
    assert isinstance(chunks, list)

    # len(text) < chunk size should return a single chunk
    short_text = "This is a short text."
    chunks = shared.chunk_text(short_text)
    assert len(chunks) == 1
    assert isinstance(chunks[0], shared.Chunk)
    assert chunks[0].text == short_text

    # len(text) > chunk size should return multiple chunks
    long_text = "This is a long text. " * 1000
    chunk_size = 1000
    chunks = shared.chunk_text(long_text, chunk_size=chunk_size, chunk_overlap=200)
    assert len(chunks) > 1
    assert len(chunks) == len(long_text) // (chunk_size - 200) + 1
    assert isinstance(chunks[0], shared.Chunk)
    assert chunks[0].text == long_text[:chunk_size]
