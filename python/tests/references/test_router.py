from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient
from sidecar.api import api
from sidecar.projects import service as projects_service
from sidecar.projects.service import create_project
from sidecar.references.schemas import IngestStatus, Reference, ReferenceCreate
from sidecar.references.storage import JsonStorage

from ..helpers import _copy_fixture_to_temp_dir

client = TestClient(api)


def test_ingest_references_for_uploads_directory(setup_project_with_uploads):
    project_id = "project1"
    uploads_dir = projects_service.get_project_uploads_path("user1", project_id)

    request = {"type": "uploads"}
    with patch(
        "sidecar.references.ingest.run_ingest",
        return_value={"project_name": project_id, "references": []},
    ) as mock_run_ingest:
        response = client.post(f"/api/references/{project_id}", json=request)

    mock_run_ingest.assert_called_once_with(pdf_directory=uploads_dir)
    assert response.status_code == 200
    assert len(response.json()["references"]) == 0


def test_ingest_references_for_pdf_url(setup_project_with_uploads):
    project_id = "project1"
    return_value = Reference(
        id="123", source_filename="fake.pdf", status=IngestStatus.COMPLETE
    )

    request = {
        "type": "pdf",
        "url": "http://somefakeurl.com/fake.pdf",
        "metadata": {
            "source_filename": "fake.pdf",
            "title": "fake title",
        },
    }

    # since we import `create_reference_from_url` from `service.py` into `router.py`
    # we need to patch at the `router` level
    with patch(
        "sidecar.references.router.create_reference_from_url",
        return_value=return_value,
    ) as mock_create_reference_from_url:
        response = client.post(f"/api/references/{project_id}", json=request)

    mock_create_reference_from_url.assert_called_once_with(
        project_id, url=request["url"], metadata=ReferenceCreate(**request["metadata"])
    )
    assert response.status_code == 200
    assert len(response.json()["references"]) == 1


def test_list_references_should_return_empty_list(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)

    _ = create_project(user_id, project_id, project_name="foo")

    # .storage/references.json does not exist as no references have been ingested
    response = client.get(f"/api/references/{project_id}")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_list_references_should_return_references(monkeypatch, tmp_path, fixtures_dir):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)
    project = create_project(user_id, project_id, project_name="foo")
    mocked_path = Path(project.path) / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = f"{fixtures_dir}/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    response = client.get(f"/api/references/{project_id}")
    assert response.status_code == 200
    assert len(response.json()) == len(jstore.references)
    assert len(response.json()) != 0


def test_get_reference(monkeypatch, tmp_path, fixtures_dir):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)
    project = create_project(user_id, project_id, project_name="foo")
    mocked_path = Path(project.path) / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = f"{fixtures_dir}/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # get the first reference
    ref = jstore.references[0]

    response = client.get(f"/api/references/{project_id}/{ref.id}")
    assert response.status_code == 200
    assert response.json() == ref.dict()


def test_references_update(monkeypatch, tmp_path, fixtures_dir):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)
    project = create_project(user_id, project_id, project_name="foo")
    mocked_path = Path(project.path) / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = f"{fixtures_dir}/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # reference should have None citation_key
    # we will update it to reda2023
    ref = jstore.references[0]
    assert ref.citation_key is None

    patch = {"data": {"citation_key": "reda2023"}}
    response = client.patch(f"/api/references/{project_id}/{ref.id}", json=patch)

    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    # reload from `mocked_path` to check that the update was successful
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # check that the citation key has been updated
    assert jstore.references[0].citation_key == "reda2023"


def test_references_bulk_delete(monkeypatch, tmp_path, fixtures_dir):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)
    project = create_project(user_id, project_id, project_name="foo")
    mocked_path = Path(project.path) / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = f"{fixtures_dir}/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    assert len(jstore.references) == 2

    ids = [ref.id for ref in jstore.references]
    request = {"reference_ids": ids}

    response = client.post(f"/api/references/{project_id}/bulk_delete", json=request)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
    }

    # reload from `mocked_path` to check that the update was successful
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # ensure that the reference was deleted
    assert len(jstore.references) == 0
