import json
import os
from pathlib import Path
from uuid import uuid4

from sidecar import config
from sidecar.references import ingest, storage
from sidecar.references.schemas import IngestStatus, Reference


def _copy_fixture_to_temp_dir(source_path: Path, write_path: Path) -> None:
    """
    Copies test fixtures (pdfs, xml) to a temporary directory
    for testing. This is because `ingest` creates additional
    directories and files which should be cleaned after the test.
    """
    if not write_path.parent.exists():
        write_path.parent.mkdir()

    with open(source_path, "rb") as f:
        file_bytes = f.read()
    with open(write_path, "wb") as f:
        f.write(file_bytes)


def test_run_ingest(monkeypatch, tmp_path, fixtures_dir):
    # directories where ingest will write files
    staging_dir = tmp_path.joinpath(".staging")
    grobid_output_dir = tmp_path.joinpath(".grobid")
    json_storage_dir = tmp_path.joinpath(".storage")

    # copy test PDFs to temp dir
    path = Path(f"{fixtures_dir}/pdf/")
    for pdf in path.glob("*.pdf"):
        write_path = tmp_path.joinpath("uploads", pdf.name)
        _copy_fixture_to_temp_dir(pdf, write_path)

    monkeypatch.setattr(config, "UPLOADS_DIR", tmp_path.joinpath("uploads"))

    # grobid server takes an input directory of PDFs
    # if grobid successfully parses the file, it creates a {pdfname}.tei.xml file
    # if grobid fails to parse the file, it creates a {pdfname}_{errorcode}.txt file
    # mock this by copying the test xml to the output directory
    def mock_grobid_client_process(*args, **kwargs):
        path = Path(f"{fixtures_dir}/xml/")
        for file_ in path.glob("*"):
            write_path = grobid_output_dir.joinpath(file_.name)
            _copy_fixture_to_temp_dir(file_, write_path)

    monkeypatch.setattr(ingest.GrobidClient, "process", mock_grobid_client_process)

    pdf_directory = tmp_path.joinpath("uploads")
    response = ingest.run_ingest(pdf_directory=pdf_directory)

    # project name is the name of the parent directory of the input directory
    assert response.project_name == tmp_path.name

    # check that the expected number of references were parsed
    assert len(response.references) == 2

    # sort references by source_filename so list order is consistent
    references = sorted(response.references, key=lambda x: x.source_filename)

    # check that grobid-fails.pdf is contained in the reference output
    assert references[0].source_filename == "grobid-fails.pdf"
    assert references[0].citation_key == "untitled"

    # check that grobid failures have text extracted
    assert len(references[0].contents) > 0
    assert len(references[0].chunks) > 0

    # check that test.pdf was parsed correctly
    assert references[1].title == "A Few Useful Things to Know about Machine Learning"
    assert references[1].doi is None
    assert len(references[1].authors) == 1
    assert references[1].authors[0].full_name == "Pedro Domingos"
    assert references[1].citation_key == "domingos"

    # check that all temporary files were cleaned up ...
    assert len(os.listdir(staging_dir)) == 0
    assert len(os.listdir(grobid_output_dir)) == 0
    assert len(os.listdir(json_storage_dir)) == 1

    # ... except for the references.json file
    references_json_path = json_storage_dir.joinpath("references.json")
    assert references_json_path.exists()

    # references.json should contain the same references in stdout
    with open(references_json_path, "r") as f:
        assert json.load(f) == response.dict()["references"]


def test_ingest_get_statuses(monkeypatch, tmp_path, fixtures_dir):
    monkeypatch.setattr(ingest, "UPLOADS_DIR", Path(f"{fixtures_dir}/pdf"))

    # test: JsonStorage path does not exist
    # expect: all `uploads` are in process
    fake_filepath = tmp_path.joinpath("does_not_exist.json")

    jstore = storage.JsonStorage(fake_filepath)
    fetcher = ingest.IngestStatusFetcher(storage=jstore)
    response = fetcher.emit_statuses()

    statuses = response.reference_statuses

    assert response.status == "ok"
    assert len(statuses) == 2
    for ref in statuses:
        ref.status == "processing"

    # test: stored references should be checked against uploads
    # expect: stored references return stored status,
    #   uploads (not yet stored) return processeding
    mock_references = [
        Reference(
            id=str(uuid4()),
            source_filename="completed.pdf",
            status=IngestStatus.COMPLETE,
        ),
        Reference(
            id=str(uuid4()),
            source_filename="failed.pdf",
            status=IngestStatus.FAILURE,
        ),
    ]
    mock_uploads = [
        Path("completed.pdf"),  # retain mock_reference.status
        Path("failed.pdf"),  # retain mock_reference.status
        Path("not_yet_processed.pdf"),  # not in mock_reference -> `processing`
    ]

    def mock_storage_load(*args, **kwargs):
        # do nothing since we also mock references propery
        pass

    jstore = storage.JsonStorage("to_be_mocked.json")
    monkeypatch.setattr(jstore, "load", mock_storage_load)
    monkeypatch.setattr(jstore, "references", mock_references)

    fetcher = ingest.IngestStatusFetcher(storage=jstore)
    monkeypatch.setattr(fetcher, "uploads", mock_uploads)

    response = fetcher.emit_statuses()

    statuses = response.reference_statuses

    assert response.status == "ok"
    assert len(statuses) == 3
    for ref in statuses:
        if ref.source_filename == "completed.pdf":
            ref.status == "completed"
        elif ref.source_filename == "failed.pdf":
            ref.status == "failure"
        else:
            ref.status == "processing"

    # test: Exception on storage load should return error status
    # expect: response status = error, ref statuses = []
    def mock_storage_load_raises_exception(*args, **kwargs):
        raise Exception

    monkeypatch.setattr(jstore, "load", mock_storage_load_raises_exception)
    response = fetcher.emit_statuses()

    statuses = response.reference_statuses

    assert response.status == "error"
    assert len(statuses) == 0
