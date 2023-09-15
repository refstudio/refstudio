from sidecar.projects.service import get_project_uploads_path
from sidecar.references.schemas import ReferenceCreate
from sidecar.references.service import create_reference_from_url, requests
from sidecar.references.storage import JsonStorage


def test_create_reference_from_url(
    monkeypatch, tmp_path, mock_url_pdf_response, setup_project_references_json
):
    monkeypatch.setattr(requests, "get", mock_url_pdf_response)

    project_id = "project1"
    url = "http://somefakeurl.com"

    metadata = ReferenceCreate(
        source_filename="test_create_reference_from_url.pdf",
        title="Some new title",
    )

    create_reference_from_url(project_id=project_id, url=url, metadata=metadata)

    uploads = get_project_uploads_path("user1", project_id)
    assert (uploads / metadata.source_filename).exists()

    store = JsonStorage(setup_project_references_json)
    store.load()
    assert store.references[-1].source_filename == metadata.source_filename
