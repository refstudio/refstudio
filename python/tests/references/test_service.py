from datetime import date
from uuid import uuid4

from sidecar.projects.service import get_project_uploads_path
from sidecar.references.schemas import Author, IngestStatus, Reference, ReferenceCreate
from sidecar.references.service import (
    add_citation_keys_for_references,
    create_reference,
    requests,
)
from sidecar.references.storage import JsonStorage


def test_create_reference_with_url(
    monkeypatch, tmp_path, mock_url_pdf_response, setup_project_references_json
):
    monkeypatch.setattr(requests, "get", mock_url_pdf_response)

    project_id = "project1"
    url = "http://somefakeurl.com"

    metadata = ReferenceCreate(
        source_filename="test_create_reference_from_url.pdf",
        title="Some new title",
    )

    ref = create_reference(project_id=project_id, metadata=metadata, url=url)

    assert isinstance(ref, Reference)

    uploads = get_project_uploads_path("user1", project_id)
    assert (uploads / metadata.source_filename).exists()

    store = JsonStorage(setup_project_references_json)
    store.load()
    assert store.references[-1].source_filename == metadata.source_filename


def test_create_reference_with_only_metadata(
    monkeypatch, tmp_path, setup_project_references_json
):
    project_id = "project1"

    # source_filename is not provided, so it will be {title}.pdf
    metadata = ReferenceCreate(
        title="Some new title",
        authors=[Author(full_name="Frank Fakerson")],
    )

    ref = create_reference(project_id=project_id, metadata=metadata)

    assert isinstance(ref, Reference)
    assert ref.citation_key == "fakerson"

    store = JsonStorage(setup_project_references_json)
    store.load()

    assert store.references[-1].id == ref.id
    assert store.references[-1].title == metadata.title


def test_ingest_add_citation_keys():
    # set up base reference with required fields
    # we'll be copying this reference and modifying it for each test
    base_reference = Reference(
        id=str(uuid4()), source_filename="test.pdf", status="complete"
    )
    fake_data = [
        {
            "full_name": "John Smith",
            "published_date": None,
            "expected_citation_key": "smith",
        },
        {
            "full_name": "Kathy Jones",
            "published_date": date(2021, 1, 1),
            "expected_citation_key": "jones2021",
        },
        {
            "full_name": "Jane Doe",
            "published_date": date(2022, 1, 1),
            "expected_citation_key": "doe2022",
        },
    ]

    # test: references with different authors
    # expect: should have unique citation keys
    refs = []
    for d in fake_data:
        reference = base_reference.copy()
        reference.authors = [Author(full_name=d["full_name"])]
        reference.published_date = d["published_date"]
        refs.append(reference)

    tested = add_citation_keys_for_references(refs, existing_references=[])

    for ref, d in zip(tested, fake_data):
        assert ref.citation_key == d["expected_citation_key"]

    # test: references with no author and no published year
    # expect: should have citation key "untitled" appeneded with a number
    refs = []
    for i in range(5):
        reference = base_reference.copy()
        reference.authors = []
        refs.append(reference)

    tested = add_citation_keys_for_references(refs, existing_references=[])

    for i, ref in enumerate(tested):
        if i == 0:
            assert ref.citation_key == "untitled"
        else:
            assert ref.citation_key == f"untitled{i - 1 + 1}"

    # test: references with no author but with published years
    # expect: should have citation key "untitled" appeneded with the year
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.published_date = date(2020 + i, 1, 1)
        reference.authors = []
        refs.append(reference)

    tested = add_citation_keys_for_references(refs, existing_references=[])

    for i, ref in enumerate(tested):
        assert ref.citation_key == f"untitled{ref.published_date.year}"

    # test: references with no author and duplicate published years
    # expect: should have citation key "untitled" appeneded with year and a letter
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.published_date = date(2020, 1, 1)
        reference.authors = []
        refs.append(reference)

    tested = add_citation_keys_for_references(refs, existing_references=[])

    for i, ref in enumerate(tested):
        if i == 0:
            expected = f"untitled{ref.published_date.year}"
        else:
            expected = f"untitled{ref.published_date.year}{chr(97 + i)}"
        assert ref.citation_key == expected

    # test: references with same author last name and no published year
    # expect: should have citation key of author's last name appended with a letter
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.authors = [Author(full_name="John Smith")]
        refs.append(reference)

    tested = add_citation_keys_for_references(refs, existing_references=[])

    for i, ref in enumerate(tested):
        if i == 0:
            assert ref.citation_key == "smith"
        else:
            assert ref.citation_key == f"smith{chr(97 + i)}"

    # test: references with same author and same published years
    # expect: should have citation key of author's last name + year + letter
    refs = []
    for i in range(3):
        reference = base_reference.copy()
        reference.published_date = date(2021, 1, 1)
        reference.authors = [Author(full_name="John Smith")]
        refs.append(reference)

    tested = add_citation_keys_for_references(refs, existing_references=[])

    ## should be smith2021a, smith2021b, smith2021c
    for i, ref in enumerate(tested):
        if i == 0:
            assert ref.citation_key == "smith2021"
        else:
            assert ref.citation_key == f"smith2021{chr(97 + i)}"

    # test: ingesting new references should not modify existing citation keys
    # expect: previously created citation keys should be unchanged ...
    #   ... but new references should have unique citation keys
    existing_refs = [
        Reference(
            id=str(uuid4()),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
            authors=[Author(full_name="Kathy Jones")],
            published_date=date(2021, 1, 1),
            citation_key="jones2021",
        ),
        Reference(
            id=str(uuid4()),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
            authors=[Author(full_name="Kathy Jones")],
            published_date=date(2021, 1, 1),
            citation_key="jones2021a",
        ),
        Reference(
            id=str(uuid4()),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
            authors=[Author(full_name="John Smith")],
            citation_key="smith",
        ),
        Reference(
            id=str(uuid4()),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
            citation_key="untitled",
        ),
        Reference(
            id=str(uuid4()),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
            citation_key="untitled1",
        ),
    ]
    new_refs = [
        Reference(
            id=str(uuid4()),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
            authors=[Author(full_name="Kathy Jones")],
            published_date=date(2021, 1, 1),
        ),
        Reference(
            id=str(uuid4()),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
            authors=[Author(full_name="John Smith")],
        ),
        Reference(
            id=str(uuid4),
            source_filename="test.pdf",
            status=IngestStatus.PROCESSING,
        ),
    ]

    tested = add_citation_keys_for_references(
        new_refs, existing_references=existing_refs
    )
    new_keys = sorted([ref.citation_key for ref in tested])

    assert new_keys == sorted(["jones2021b", "smitha", "untitled2"])
