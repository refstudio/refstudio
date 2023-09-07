from uuid import UUID

from fastapi.testclient import TestClient
from sidecar.api import api
from sidecar.projects import service

client = TestClient(api)


def test_http_list_projects(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"

    response = client.get("/api/projects")

    assert response.status_code == 200
    assert response.json() == {}

    service.create_project(user_id, project_id, project_name)

    response = client.get("/api/projects")
    assert response.status_code == 200
    expected = {
        project_id: {
            "project_name": project_name,
            "project_path": str(tmp_path / user_id / project_id),
        }
    }
    assert response.json() == expected


def test_create_project(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    request = {"project_name": "project1name"}
    response = client.post("/api/projects", json=request)

    project_id = list(response.json().keys())[0]
    assert response.status_code == 200
    assert response.json() == {
        project_id: {
            "project_name": "project1name",
            "project_path": str(tmp_path / "user1" / project_id),
        }
    }

    # should create project with random uuid4
    assert isinstance(UUID(project_id), UUID)

    # should create project in user's home directory
    user_id = "user1"
    project_path = tmp_path / user_id / project_id
    assert response.json()[project_id]["project_path"] == str(project_path)
    assert project_path.exists()

    storage = service.read_project_path_storage(user_id)
    assert project_id in storage


def test_get_project(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = service.create_project(user_id, project_id, project_name)

    # get the project
    response = client.get(f"/api/projects/{project_id}")

    assert response.status_code == 200
    assert response.json() == {
        "id": project_id,
        "name": project_name,
        "path": str(project_path),
    }


def test_delete_project(monkeypatch, tmp_path):
    monkeypatch.setattr(service, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = service.create_project(user_id, project_id, project_name)

    # delete the project
    response = client.delete(f"/api/projects/{project_id}")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Project deleted",
        "project_id": project_id,
    }

    # check that the project was deleted
    assert not project_path.exists()

    storage = service.read_project_path_storage(user_id)
    assert project_id not in storage
