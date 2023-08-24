from datetime import date, datetime
from pathlib import Path
from uuid import uuid4

from sidecar import settings, shared, typing
from sidecar.typing import Author, Reference

from .test_ingest import _copy_fixture_to_temp_dir


def test_get_word_count():
    assert shared.get_word_count("Hello World") == 2


def test_parse_date():
    # Grobid returns dates in ISO 8601 YYYY-mm-dd format
    # so this is all this function needs to support for now
    assert shared.parse_date("2019-01-01") == date(2019, 1, 1)
    assert shared.parse_date("abc") is None


def test_get_first_author_surname():
    a = [
        Author(full_name="Dan Vanderkam", given_name="Dan", surname="Vanderkam"),
        Author(
            full_name="Jeff Hammerbacher", given_name="Jeff", surname="Hammerbacher"
        ),
    ]
    assert shared.get_first_author_surname(a) == "Vanderkam"

    b = [
        Author(full_name="Jeff Hammerbacher", given_name="Jeff", surname="Hammerbacher")
    ]
    assert shared.get_first_author_surname(b) == "Hammerbacher"

    c = [Author(full_name="Jeff Hammerbacher", given_name="Jeff")]
    assert shared.get_first_author_surname(c) == "Hammerbacher"

    d = [Author(full_name="Jeff")]
    assert shared.get_first_author_surname(d) is None


def test_create_citation_key():
    test_data = [
        {
            "id": str(uuid4()),
            "source_filename": "abc.pdf",
            "status": "complete",
            "authors": [
                Author(
                    full_name="Dan Vanderkam", given_name="Dan", surname="Vanderkam"
                ),
                Author(
                    full_name="Jeff Hammerbacher",
                    given_name="Jeff",
                    surname="Hammerbacher",
                ),
            ],
            "published_date": datetime(2016, 1, 1),
            "title": "pileup.js: a JavaScript library for interactive and in-browser visualization of genomic data",
        },
        {
            "id": str(uuid4()),
            "source_filename": "abc.pdf",
            "status": "complete",
            "authors": [
                Author(
                    full_name="Jeff Hammerbacher",
                    given_name="Jeff",
                    surname="Hammerbacher",
                )
            ],
            "published_date": None,
        },
        {
            "id": str(uuid4()),
            "source_filename": "abc.pdf",
            "status": "complete",
            "authors": [],
            "published_date": None,
        },
        {
            "id": str(uuid4()),
            "source_filename": "abc.pdf",
            "status": "complete",
            "authors": [],
            "published_date": date(2020, 1, 1),
        },
    ]
    references = [Reference(**data) for data in test_data]
    assert shared.create_citation_key(references[0]) == "vanderkam2016"
    assert shared.create_citation_key(references[1]) == "hammerbacher"
    assert shared.create_citation_key(references[2]) == "untitled"
    assert shared.create_citation_key(references[3]) == "untitled2020"


def test_extract_text_from_pdf():
    pdf_file = "fixtures/pdf/grobid-fails.pdf"
    test_filepath = Path(__file__).parent.joinpath(pdf_file)
    text = shared.extract_text_from_pdf(test_filepath)

    assert isinstance(text, str)
    assert len(text) > 0


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


def test_chunk_reference(monkeypatch, tmp_path):
    test_file = "fixtures/pdf/test.pdf"
    filepath = Path(__file__).parent.joinpath(test_file)

    # mock uploads directory
    _copy_fixture_to_temp_dir(filepath, tmp_path.joinpath("test.pdf"))
    monkeypatch.setattr(settings, "UPLOADS_DIR", tmp_path)

    reference = Reference(
        id=str(uuid4()),
        source_filename="test.pdf",
        status="complete",
    )
    chunks = shared.chunk_reference(reference)

    assert len(chunks) > 0
    assert isinstance(chunks[0], shared.Chunk)

    for chunk in chunks:
        assert chunk.text is not None
        assert chunk.metadata != {}
        assert chunk.metadata["page_num"] is not None


def test_trim_completion_prefix_from_choices():
    # test 1: prefix is a single sentence and response includes part of the sentence
    test_prefix = "This is a prefix and we have "
    choices = [
        typing.TextCompletionChoice(
            index=0, text="This is a prefix and we have inserted some text."
        ),
        typing.TextCompletionChoice(
            index=1, text="This is a prefix and we have added some text."
        ),
        typing.TextCompletionChoice(index=2, text="updated some text."),
    ]
    trimmed_choices = shared.trim_completion_prefix_from_choices(test_prefix, choices)
    assert len(trimmed_choices) == 3
    assert trimmed_choices[0].text == "inserted some text."
    assert trimmed_choices[1].text == "added some text."
    assert trimmed_choices[2].text == "updated some text."

    # test 2: prefix is many sentences and response includes part of the last sentence
    test_prefix = "This is a very long prefix. But we only append to the last piece. The last piece is "
    choices = [
        typing.TextCompletionChoice(
            index=0, text="The last piece is part of the prefix."
        ),
        typing.TextCompletionChoice(
            index=1, text="The last piece is part of the test."
        ),
        typing.TextCompletionChoice(index=2, text="something else."),
    ]
    trimmed_choices = shared.trim_completion_prefix_from_choices(test_prefix, choices)
    assert len(trimmed_choices) == 3
    assert trimmed_choices[0].text == "part of the prefix."
    assert trimmed_choices[1].text == "part of the test."
    assert trimmed_choices[2].text == "something else."

    # test 3: prefix is many sentences and response includes the entire prefix
    test_prefix = "This is a very long prefix. But we only append to the last piece. The last piece is "
    choices = [
        typing.TextCompletionChoice(
            index=0,
            text=(
                "This is a very long prefix. But we only append to the last piece. "
                "The last piece is part of the prefix."
            ),
        ),
        typing.TextCompletionChoice(
            index=1,
            text=(
                "This is a very long prefix. But we only append to the last piece. "
                "The last piece is part of the test."
            ),
        ),
        typing.TextCompletionChoice(
            index=2,
            text=(
                "This is a very long prefix. But we only append to the last piece. "
                "The last piece is something else."
            ),
        ),
    ]
    trimmed_choices = shared.trim_completion_prefix_from_choices(test_prefix, choices)
    assert len(trimmed_choices) == 3
    assert trimmed_choices[0].text == "part of the prefix."
    assert trimmed_choices[1].text == "part of the test."
    assert trimmed_choices[2].text == "something else."
