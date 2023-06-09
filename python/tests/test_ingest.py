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
    # directories where ingest will write files
    grobid_output_dir = tmp_path.joinpath(".grobid")
    json_storage_dir = tmp_path.joinpath(".storage")

    # copy test PDFs to temp dir
    for pdf in FIXTURES_DIR.joinpath("pdf").glob("*.pdf"):
        write_path = tmp_path.joinpath("uploads", pdf.name)
        _copy_fixture_to_temp_dir(pdf, write_path)

    # grobid server takes an input directory of PDFs
    # if grobid successfully parses the file, it creates a {pdfname}.tei.xml file
    # if grobid fails to parse the file, it creates a {pdfname}_{errorcode}.txt file
    # mock this by copying the test xml to the output directory
    def mock_grobid_client_process(*args, **kwargs):
        for file_ in FIXTURES_DIR.joinpath("xml").glob("*"):
            write_path = grobid_output_dir.joinpath(file_.name)
            _copy_fixture_to_temp_dir(file_, write_path)
    
    monkeypatch.setattr(ingest.GrobidClient, "process", mock_grobid_client_process)

    pdf_directory = tmp_path.joinpath("uploads")
    ingest.main(pdf_directory)

    # check that the expected output was printed to stdout
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    # project name is the name of the parent directory of the input directory
    assert output['project_name'] == tmp_path.name

    # check that the expected number of references were parsed
    assert len(output['references']) == 2

    # sort references by source_filename so list order is consistent
    references = sorted(output['references'], key=lambda x: x['source_filename'])

    # check that grobid-fails.pdf is contained in the reference output
    assert references[0]['source_filename'] == "grobid-fails.pdf"

    # check that test.pdf was parsed correctly
    assert references[1]['title'] == "A Few Useful Things to Know about Machine Learning"
    assert len(references[1]['authors']) == 1
    assert references[1]['authors'][0]['full_name'] == "Pedro Domingos"

    # check that the expected directories and files were created
    # grobid output
    assert grobid_output_dir.exists()
    assert grobid_output_dir.joinpath("test.tei.xml").exists()
    assert grobid_output_dir.joinpath("grobid-fails_500.txt").exists()
    # json creation and storage - successfully parsed references are stored as json
    assert json_storage_dir.exists()
    assert json_storage_dir.joinpath("test.json").exists()
