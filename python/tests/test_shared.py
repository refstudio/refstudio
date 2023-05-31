import numpy as np
import pytest
from sidecar import shared


def test_get_word_count():
    assert shared.get_word_count("Hello World") == 2


def test_get_filename_md5():
    assert shared.get_filename_md5("test.pdf") == "754dc77d28e62763c4916970d595a10f"


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


def test_embed_text():
    # empty text should return empty list
    embeddings = shared.embed_text([])
    assert len(embeddings) == 0

    # bare string should raise ValueError
    text = "This should return a ValueError because it's not within a list."
    pytest.raises(ValueError, shared.embed_text, text)

    # list of sentences should return an embedding of floats of equivalent length
    text = ["This is a short text.", "This is another short text."]
    embeddings = shared.embed_text(text)
    assert len(embeddings) == len(text)
    assert isinstance(embeddings, (list, np.ndarray))
    assert isinstance(embeddings[0][0], (float, np.float32, np.float64))
