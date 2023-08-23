import json
from pathlib import Path

from sidecar import storage, typing
from sidecar.typing import Author, Chunk, Reference
import semanticscholar
from semanticscholar import SemanticScholarObject


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


def test_link_references(monkeypatch, tmp_path, capsys):
    # Create a sample paper for the purpose of testing.
    # Mock paper class
    class MockPaper:
        def __init__(self, title=None, paperId=None, doi=None):
            self.title = title
            self.paperId = paperId
            self.doi = "10.1234/5678"

    s2_paper = MockPaper(title="Some title", paperId="1234567890", doi="10.1234/5678")

    # Mock s2_object so that it always returns the above s2_paper.
    class MockS2Object:
        def get_paper(self, doi, fields):
            return s2_paper

    # Install the mock
    monkeypatch.setattr(semanticscholar, "SemanticScholar", MockS2Object)

    # Given
    fp = Path(__file__).parent.joinpath("fixtures/data/references.json")
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()

    # When
    jstore.link_s2_doi()

    # Then
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    # Check that the operation was successful
    assert output["status"] == "ok"
    assert output["message"] == "Linking with s2 complete for 1 out of 2 references"

    # Check the new s2_paperId
    assert jstore.references[0].s2_paperId == "1234567890"


def test_json_storage_update(monkeypatch, tmp_path, capsys):
    fp = Path(__file__).parent.joinpath("fixtures/data/references.json")
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()

    # mock the filepath before save
    # we do not want modify our test reference data for other tests
    savepath = tmp_path.joinpath("references.json")
    monkeypatch.setattr(jstore, "filepath", savepath)

    # -------------

    # test: update for `source_filename` that does not exist
    # expect: no References are changed and json response in stdout = ERROR

    bad_update = typing.ReferenceUpdate(
        source_filename="does_not_exist.pdf",
        patch=typing.ReferencePatch(data={"citation_key": "should-not-change"}),
    )

    jstore.update(bad_update)

    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output["status"] == "error"
    assert output["message"] != ""

    # -------------

    # reload and remock storage for new test
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()
    monkeypatch.setattr(jstore, "filepath", savepath)

    # test: update `citation_key` for one Reference
    # expect: Reference that has been updated has new citation key
    #   and no other Reference metadata has changed
    #   and json response in stdout = OK

    # create the ReferenceUpdate object for input
    ref = jstore.references[0]

    reference_update = typing.ReferenceUpdate(
        source_filename=ref.source_filename,
        patch=typing.ReferencePatch(data={"citation_key": "reda2023"}),
    )

    jstore.update(reference_update)

    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output["status"] == "ok"
    assert output["message"] == ""

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


def test_storage_delete_references(monkeypatch, tmp_path, capsys):
    fp = Path(__file__).parent.joinpath("fixtures/data/references.json")
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()

    # mock the filepath before save
    # we do not want modify our test reference data for other tests
    savepath = tmp_path.joinpath("references.json")
    monkeypatch.setattr(jstore, "filepath", savepath)

    # -------------

    # test: delete with `all_=True`
    # expect: all References should be deleted, json response in stdout = OK
    jstore.delete(all_=True)

    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output["status"] == "ok"
    assert output["message"] == ""

    # reload from `savepath` to check that the delete was successful
    jstore = storage.JsonStorage(filepath=savepath)
    jstore.load()

    source_filenames_from_storage = [ref.source_filename for ref in jstore.references]
    assert len(source_filenames_from_storage) == 0

    # -------------

    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()
    monkeypatch.setattr(jstore, "filepath", savepath)

    # test: delete source_filename that is present in references.json
    # expect: corresponding Reference is deleted
    #   json response in stdout should be of status: ok
    to_be_deleted = ["some_file.pdf"]

    jstore.delete(source_filenames=to_be_deleted)

    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output["status"] == "ok"
    assert output["message"] == ""

    # reload from `savepath` to check that the delete was successful
    jstore = storage.JsonStorage(filepath=savepath)
    jstore.load()

    source_filenames_from_storage = [ref.source_filename for ref in jstore.references]
    assert "some_file.pdf" not in source_filenames_from_storage

    # -------------

    # test: delete source_filename that is NOT present in references.json
    # expect: json response in stdout should be of status: error
    to_be_deleted = ["not_in_references_storage.pdf"]

    jstore.delete(to_be_deleted)

    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output["status"] == "error"
    assert output["message"] != ""
