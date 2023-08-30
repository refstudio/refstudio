from pathlib import Path
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sidecar import http, projects, search, settings
from sidecar.chat import Chat
from sidecar.rewrite import Rewriter
from sidecar.storage import JsonStorage

from .test_ingest import FIXTURES_DIR, _copy_fixture_to_temp_dir
from .test_settings import create_settings_json  # noqa: F401

sidecar_client = TestClient(http.sidecar_api)
references_client = TestClient(http.references_api)
ai_client = TestClient(http.ai_api)
filesystem_client = TestClient(http.filesystem_api)
project_client = TestClient(http.project_api)
settings_client = TestClient(http.settings_api)


@pytest.fixture
def setup_uploaded_reference_pdfs(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    _ = projects.create_project(user_id, project_id)

    # create a file
    filename = "uploads/test.pdf"

    with open(f"{FIXTURES_DIR}/pdf/test.pdf", "rb") as f:
        _ = filesystem_client.put(
            f"/{project_id}/{filename}",
            files={"file": ("test.pdf", f, "application/pdf")},
        )


def test_list_references(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    response = references_client.get(f"/{project_id}")
    assert response.status_code == 200
    assert len(response.json()) == len(jstore.references)
    assert len(response.json()) != 0


def test_get_reference(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # get the first reference
    ref = jstore.references[0]

    response = references_client.get(f"/{project_id}/{ref.id}")
    assert response.status_code == 200
    assert response.json() == ref.dict()


def test_references_update(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # reference should have None citation_key
    # we will update it to reda2023
    ref = jstore.references[0]
    assert ref.citation_key is None

    patch = {"data": {"citation_key": "reda2023"}}
    response = references_client.patch(f"/{project_id}/{ref.id}", json=patch)

    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    # reload from `mocked_path` to check that the update was successful
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # check that the citation key has been updated
    assert jstore.references[0].citation_key == "reda2023"


def test_references_bulk_delete(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    assert len(jstore.references) == 2

    ids = [ref.id for ref in jstore.references]
    request = {"reference_ids": ids}

    response = references_client.post(f"/{project_id}/bulk_delete", json=request)

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


def test_ai_rewrite_is_ok(monkeypatch, mock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", mock_call_model_is_ok)

    request = {"text": "This is a test"}
    response = sidecar_client.post("/rewrite", json=request)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
        "choices": [
            {
                "index": 0,
                "text": "This is a mocked response",
            }
        ],
    }


def test_ai_rewrite_missing_required_request_params(monkeypatch, mock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", mock_call_model_is_ok)

    request = {"missing": "This is an invalid request"}
    response = sidecar_client.post("/rewrite", json=request)

    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "loc": ["body", "text"],
                "msg": "field required",
                "type": "value_error.missing",
            }
        ]
    }


def test_ai_completion_is_ok(monkeypatch, mock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", mock_call_model_is_ok)

    request = {"text": "This is a test"}
    response = sidecar_client.post("/completion", json=request)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
        "choices": [
            {
                "index": 0,
                "text": "This is a mocked response",
            }
        ],
    }


def test_ai_completion_missing_required_request_params(
    monkeypatch, mock_call_model_is_ok
):
    monkeypatch.setattr(Rewriter, "call_model", mock_call_model_is_ok)

    request = {"missing": "This is an invalid request"}
    response = sidecar_client.post("/completion", json=request)

    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "loc": ["body", "text"],
                "msg": "field required",
                "type": "value_error.missing",
            }
        ]
    }


def test_ai_chat_is_ok(monkeypatch, mock_call_model_is_ok, tmp_path):
    monkeypatch.setattr(Chat, "call_model", mock_call_model_is_ok)

    # copy references.json to temp dir and mock settings.REFERENCES_JSON_PATH
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)
    mocked_path = tmp_path.joinpath("references.json")

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)
    monkeypatch.setattr(settings, "REFERENCES_JSON_PATH", mocked_path)

    request = {"text": "This is a test"}
    response = sidecar_client.post("/chat", json=request)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
        "choices": [
            {
                "index": 0,
                "text": "This is a mocked response",
            }
        ],
    }


def test_ai_chat_missing_required_request_params(
    monkeypatch, mock_call_model_is_ok, tmp_path
):
    monkeypatch.setattr(Chat, "call_model", mock_call_model_is_ok)

    # copy references.json to temp dir and mock settings.REFERENCES_JSON_PATH
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)
    mocked_path = tmp_path.joinpath("references.json")

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)
    monkeypatch.setattr(settings, "REFERENCES_JSON_PATH", mocked_path)

    request = {"missing": "This is an invalid request"}
    response = sidecar_client.post("/chat", json=request)

    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "loc": ["body", "text"],
                "msg": "field required",
                "type": "value_error.missing",
            }
        ]
    }


def test_search_s2_is_ok(monkeypatch, mock_search_paper):
    monkeypatch.setattr(search.Searcher, "search_func", mock_search_paper)

    request = {"query": "any-query-string-you-like"}
    response = sidecar_client.post("/search", json=request)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
        "results": [
            {
                "title": "Sample Paper Title",
                "abstract": "Sample Abstract",
                "venue": "Sample Venue",
                "year": 2021,
                "paperId": "sample-id-1",
                "citationCount": 10,
                "openAccessPdf": "https://sample1.pdf",
                "authors": ["author1", "author2", "author3"],
            },
            {
                "title": "Sample Paper Title 2",
                "abstract": "Sample Abstract 2",
                "venue": "Sample Venue 2",
                "year": 2022,
                "paperId": "sample-id-2",
                "citationCount": 20,
                "openAccessPdf": "https://sample2.pdf",
                "authors": ["author1", "author2", "author3"],
            },
        ],
    }


def test_http_list_projects(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"

    response = project_client.get("/")

    assert response.status_code == 200
    assert response.json() == {}

    projects.create_project(user_id, project_id, project_name)

    response = project_client.get("/")
    assert response.status_code == 200
    expected = {
        project_id: {
            "project_name": project_name,
            "project_path": str(tmp_path / user_id / project_id),
        }
    }
    assert response.json() == expected


def test_create_project(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    params = {"project_name": "project1name"}
    response = project_client.post("/", params=params)

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

    storage = projects.read_project_path_storage(user_id)
    assert project_id in storage


def test_get_project(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = projects.create_project(user_id, project_id, project_name)

    # get the project
    response = project_client.get(f"/{project_id}")

    assert response.status_code == 200
    assert response.json() == {
        "project_id": project_id,
        "project_name": "project1name",
        "project_path": str(project_path),
        "contents": {},
    }


def test_delete_project(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = projects.create_project(user_id, project_id, project_name)

    # delete the project
    response = project_client.delete(f"/{project_id}")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Project deleted",
        "project_id": project_id,
    }

    # check that the project was deleted
    assert not project_path.exists()

    storage = projects.read_project_path_storage(user_id)
    assert project_id not in storage


def test_create_file(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = projects.create_project(user_id, project_id, project_name)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{FIXTURES_DIR}/pdf/grobid-fails.pdf", "rb") as f:
        response = filesystem_client.put(
            f"/{project_id}/{filename}",
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


def test_read_file(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = projects.create_project(user_id, project_id, project_name)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{FIXTURES_DIR}/pdf/grobid-fails.pdf", "rb") as f:
        response = filesystem_client.put(
            f"/{project_id}/{filename}",
            files={"file": ("grobid-fails.pdf", f, "application/pdf")},
        )

    # read the file
    response = filesystem_client.get(f"/{project_id}/{filename}")

    assert response.status_code == 200
    assert response.content == filepath.read_bytes()


def test_delete_file(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    project_path = projects.create_project(user_id, project_id, project_name)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{FIXTURES_DIR}/pdf/grobid-fails.pdf", "rb") as f:
        response = filesystem_client.put(
            f"/{project_id}/{filename}",
            files={"file": ("grobid-fails.pdf", f, "application/pdf")},
        )

    # delete the file
    response = filesystem_client.delete(f"/{project_id}/{filename}")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "File deleted",
        "filepath": str(filepath),
    }

    # check that the file was deleted
    assert not filepath.exists()


# ruff gets confused here:
# create_settings_json is a pytest fixture
def test_get_settings(monkeypatch, tmp_path, create_settings_json):  # noqa: F811
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)

    response = settings_client.get("/")
    assert response.status_code == 200
    assert response.json()["openai"]["api_key"] == "1234"


# ruff gets confused here:
# create_settings_json is a pytest fixture
def test_update_settings(monkeypatch, tmp_path, create_settings_json):  # noqa: F811
    monkeypatch.setattr(settings, "WEB_STORAGE_URL", tmp_path)
    user_id = "user1"

    response = settings.get_settings_for_user(user_id)

    data = response.dict()
    data["openai"] = {"api_key": "test"}

    response = settings_client.put("/", json=data)

    assert response.status_code == 200
    assert response.json()["openai"]["api_key"] == "test"
