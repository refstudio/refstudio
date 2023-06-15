import json
from datetime import date
from pathlib import Path

from sidecar import ingest
from sidecar.typing import Author, Reference

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
    assert references[0]['citation_key'] == "untitled"

    # check that test.pdf was parsed correctly
    assert references[1]['title'] == "A Few Useful Things to Know about Machine Learning"
    assert len(references[1]['authors']) == 1
    assert references[1]['authors'][0]['full_name'] == "Pedro Domingos"
    assert references[1]['citation_key'] == "domingos"

    # check that the expected directories and files were created
    # grobid output
    assert grobid_output_dir.exists()
    assert grobid_output_dir.joinpath("test.tei.xml").exists()
    assert grobid_output_dir.joinpath("grobid-fails_500.txt").exists()
    # json creation and storage - successfully parsed references are stored as json
    assert json_storage_dir.exists()
    assert json_storage_dir.joinpath("test.json").exists()


def test_ingest_add_citation_keys(tmp_path):
    ingestion = ingest.PDFIngestion(input_dir=tmp_path)

    # set up base reference with required fields
    # we'll be copying this reference and modifying it for each test
    base_reference = Reference(source_filename="test.pdf", filename_md5="asdf")
    fake_data = [
        {
            "full_name": "John Smith",
            "published_date": None,
            "expected_citation_key": "smith"
        },
        {
            "full_name": "Kathy Jones",
            "published_date": date(2021, 1, 1),
            "expected_citation_key": "jones2021"
        },
        {
            "full_name": "Jane Doe",
            "published_date": date(2022, 1, 1),
            "expected_citation_key": "doe2022"
        },
    ]


    # test 1 - references with unique citation keys should not be modified
    refs = []
    for d in fake_data:
        reference = base_reference.copy()
        reference.authors = [Author(full_name=d["full_name"])]
        reference.published_date = d["published_date"]
        refs.append(reference)

    tested = ingestion._add_citation_keys(refs)

    for ref, d in zip(tested, fake_data):
        assert ref.citation_key == d["expected_citation_key"]


    # test 2 - references with no author and no published year
    refs = []
    for i in range(5):
        reference = base_reference.copy()
        reference.authors = []
        refs.append(reference)
    
    tested = ingestion._add_citation_keys(refs)

    ## should be untitled1, untitled2, untitled3, etc.
    for i, ref in enumerate(tested):
        assert ref.citation_key == f"untitled{i + 1}"
    

    # test 2 - references with no author but with published years
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.published_date = date(2020 + i, 1, 1)
        reference.authors = []
        refs.append(reference)
    
    tested = ingestion._add_citation_keys(refs)

    ## should be untitled2020, untitled2021, untitled2022, etc.
    for i, ref in enumerate(tested):
        assert ref.citation_key == f"untitled{ref.published_date.year}"


    # test 3 - references with no author and duplicate published years
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.published_date = date(2020, 1, 1)
        reference.authors = []
        refs.append(reference)
    
    tested = ingestion._add_citation_keys(refs)

    ## should be untitled2020a, untitled2020b, untitled2021c, etc.
    for i, ref in enumerate(tested):
        expected = f"untitled{ref.published_date.year}{chr(97 + i)}"
        assert ref.citation_key == expected
    
    # test 3 - references with same author and no published year
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.authors = [Author(full_name="John Smith")]
        refs.append(reference)

    tested = ingestion._add_citation_keys(refs)

    ## should be smitha, smithb, smithc
    for i, ref in enumerate(tested):
        assert ref.citation_key == f"smith{chr(97 + i)}"

    # test 4 - references with same author and same published year
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.published_date = date(2021, 1, 1)
        reference.authors = [Author(full_name="John Smith")]
        refs.append(reference)

    tested = ingestion._add_citation_keys(refs)

    ## should be smith2021a, smith2021b, smith2021c
    for i, ref in enumerate(tested):
        assert ref.citation_key == f"smith2021{chr(97 + i)}"