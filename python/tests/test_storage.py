from pathlib import Path

from sidecar import storage
from sidecar.typing import Author, Chunk, Reference


def test_json_storage_load():
    fp = Path(__file__).parent.joinpath("fixtures/data/references.json")
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


def test_json_storage_update(monkeypatch, tmp_path):
    fp = Path(__file__).parent.joinpath("fixtures/data/references.json")
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()

    # update the citation key of the first reference
    ref = jstore.references[0]
    ref.citation_key = "reda2023"

    # mock the filepath before save
    # we do not want modify our test reference data for other tests
    savepath = tmp_path.joinpath("references.json")
    monkeypatch.setattr(jstore, "filepath", savepath)

    # update and save the modified references
    jstore.update(ref)

    # reload from `savepath` to check that the update was successful
    jstore = storage.JsonStorage(filepath=savepath)
    jstore.load()

    # check that the citation key has been updated
    assert jstore.references[0].citation_key == "reda2023"
    
    # check that the other reference data has not been updated
    assert len(jstore.references) == 2
    assert jstore.references[0].source_filename == "some_file.pdf"
    assert len(jstore.references[0].authors) == 2
    assert len(jstore.references[0].chunks) == 8

    assert jstore.references[1].title == "Another title"
    assert jstore.references[1].source_filename == "another_file.pdf"
    assert jstore.references[1].citation_key is None
    assert len(jstore.references[1].authors) == 2
    assert len(jstore.references[1].chunks) == 6