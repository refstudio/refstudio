import json
from pathlib import Path

from sidecar import ingest

FIXTURES_DIR = Path(__file__).parent.joinpath("fixtures")


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


def test_main(monkeypatch, tmp_path, capsys):
    # copy test pdf to temp dir
    test_pdf = FIXTURES_DIR.joinpath("pdf", "test.pdf")
    write_path = tmp_path.joinpath("uploads", "test.pdf")
    _copy_fixture_to_temp_dir(test_pdf, write_path)

    # grobid server takes an input directory of PDFs
    # and writes {pdfname.tei.xml} files to an output directory
    # mock this by copying the test xml to the output directory
    def mock_grobid_client_process(*args, **kwargs):
        test_xml = FIXTURES_DIR.joinpath("xml", "test.tei.xml")
        write_path = tmp_path.joinpath("grobid", "test.tei.xml")
        _copy_fixture_to_temp_dir(test_xml, write_path)

    monkeypatch.setattr(ingest.GrobidClient, "process", mock_grobid_client_process)

    pdf_directory = tmp_path.joinpath("uploads")
    ingest.main(pdf_directory)

    # check that the expected output was printed to stdout
    captured = capsys.readouterr()
    output = json.loads(captured.out)
    assert len(output['references']) == 1
    assert output['references'][0]['title'] == "A Few Useful Things to Know about Machine Learning"
    assert len(output['references'][0]['authors']) == 1
    assert output['references'][0]['authors'][0]['full_name'] == "Pedro Domingos"

    # check that the expected directories and files were created
    # grobid output
    assert tmp_path.joinpath("grobid").exists()
    assert tmp_path.joinpath("grobid", "test.tei.xml").exists()
    # json creation and storage
    assert tmp_path.joinpath("storage").exists()
    assert tmp_path.joinpath("storage", "test.json").exists()
    # embeddings creation and storage
    assert tmp_path.joinpath(".lancedb").exists()
