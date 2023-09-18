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


def test_add_citation_keys_for_references():
    new_references = [
        Reference(id="1", title="Some title", status=IngestStatus.COMPLETE),
        Reference(
            id="2",
            title="Some title",
            authors=[Author(full_name="Frank Fakerson")],
            status=IngestStatus.COMPLETE,
        ),
        Reference(
            id="3",
            title="Some title",
            authors=[Author(full_name="Phoebe Fakerson")],
            status=IngestStatus.COMPLETE,
        ),
    ]

    existing_references = [
        Reference(
            id="4",
            title="Some title",
            citation_key="untitled",
            status=IngestStatus.COMPLETE,
        ),
        Reference(
            id="5",
            title="Some title",
            citation_key="untitled1",
            status=IngestStatus.COMPLETE,
        ),
        Reference(
            id="6",
            title="Some title",
            authors=[Author(full_name="Phoebe Fakerson")],
            citation_key="fakerson",
            status=IngestStatus.COMPLETE,
        ),
    ]

    add_citation_keys_for_references(new_references, existing_references)

    # should get citation keys
    assert new_references[0].citation_key == "untitled2"
    assert new_references[1].citation_key == "fakersona"
    assert new_references[2].citation_key == "fakersonb"

    # should be unchanged
    assert existing_references[0].citation_key == "untitled"
    assert existing_references[1].citation_key == "untitled1"
    assert existing_references[2].citation_key == "fakerson"
