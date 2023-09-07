from fastapi.testclient import TestClient
from sidecar import config
from sidecar.api import api
from sidecar.projects.service import create_project

client = TestClient(api)


def test_create_file(monkeypatch, tmp_path, fixtures_dir):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = create_project(user_id, project_id, project_name)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{fixtures_dir}/pdf/grobid-fails.pdf", "rb") as f:
        response = client.put(
            f"/api/fs/{project_id}/{filename}",
            files={"file": ("grobid-fails.pdf", f, "application/pdf")},
        )

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "File uploaded",
        "filepath": str(filepath),
    }

    # check that the file was created
    assert filepath.exists()


def test_read_file(monkeypatch, tmp_path, fixtures_dir):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = create_project(user_id, project_id, project_name)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{fixtures_dir}/pdf/grobid-fails.pdf", "rb") as f:
        response = client.put(
            f"/api/fs/{project_id}/{filename}",
            files={"file": ("grobid-fails.pdf", f, "application/pdf")},
        )

    # read the file
    response = client.get(f"/api/fs/{project_id}/{filename}")

    assert response.status_code == 200
    assert response.content == filepath.read_bytes()


def test_delete_file(monkeypatch, tmp_path, fixtures_dir):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = create_project(user_id, project_id, project_name)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{fixtures_dir}/pdf/grobid-fails.pdf", "rb") as f:
        response = client.put(
            f"/api/fs/{project_id}/{filename}",
            files={"file": ("grobid-fails.pdf", f, "application/pdf")},
        )

    # delete the file
    response = client.delete(f"/api/fs/{project_id}/{filename}")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "File deleted",
        "filepath": str(filepath),
    }

    # check that the file was deleted
    assert not filepath.exists()
