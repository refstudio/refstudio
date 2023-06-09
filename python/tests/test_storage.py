from sidecar import storage
from sidecar.typing import Author, Chunk, Reference


def test_json_storage_load():
    fp = "tests/fixtures/data/references.json"
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()

    assert len(jstore.references) == 2
    assert isinstance(jstore.references, list)

    # len of corpus should be equal to sum of len of chunks
    total_chunks = sum([len(ref.chunks) for ref in jstore.references])
    assert len(jstore.corpus) == total_chunks

    assert jstore.tokenized_corpus == [c.lower().split() for c in jstore.corpus]

    for ref in jstore.references:
        assert isinstance(ref, Reference)

        assert isinstance(ref.authors, list)
        assert len(ref.authors) == 2

        assert isinstance(ref.chunks, list)
        assert len(ref.chunks) > 0

        for author in ref.authors:
            assert isinstance(author, Author)
        for chunk in ref.chunks:
            assert isinstance(chunk, Chunk)
