from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient
from sidecar.api import api
from sidecar.projects import service

client = TestClient(api)


def test_http_list_projects(monkeypatch, tmp_path, setup_project_storage):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    project_id = "project1"
    project_name = "project1name"

    response = client.get("/api/projects")

    assert response.status_code == 200
    expected = {
        "projects": [
            {
                "id": project_id,
                "name": project_name,
            }
        ]
    }
    assert response.json() == expected


def test_create_project(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_name = "project1name"

    request = {"project_name": project_name}
    response = client.post("/api/projects", json=request)

    project_id = response.json()["id"]

    assert response.status_code == 200
    assert response.json() == {
        "id": project_id,
        "name": project_name,
    }

    # should create project with random uuid4
    assert isinstance(UUID(project_id), UUID)

    storage = service.read_project_storage(user_id)
    assert project_id in storage.dict()["projects"]


def test_get_project(monkeypatch, tmp_path, setup_project_storage):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    # create a project
    project_id = "project1"
    project_name = "project1name"

    # get the project
    response = client.get(f"/api/projects/{project_id}")

    assert response.status_code == 200
    assert response.json() == {
        "id": project_id,
        "name": project_name,
    }


def test_delete_project(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project = service.create_project(user_id, project_id, project_name)

    # delete the project
    response = client.delete(f"/api/projects/{project_id}")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
    }

    # check that the project was deleted
    assert not Path(project.path).exists()

    storage = service.read_project_storage(user_id)
    assert project_id not in storage
