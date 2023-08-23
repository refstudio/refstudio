from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient
from sidecar import http, projects, search, settings
from sidecar.chat import Chat
from sidecar.rewrite import Rewriter
from sidecar.storage import JsonStorage
from http import api

from .test_ingest import _copy_fixture_to_temp_dir, FIXTURES_DIR

client = TestClient(api)


def test_get_references():
    # TODO
    pass


def test_references_upload():
    pass


def test_references_status():
    pass


def test_references_update(monkeypatch, tmp_path):
    # copy references.json to temp dir and mock settings.REFERENCES_JSON_PATH
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)
    mocked_path = tmp_path.joinpath("references.json")

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)
    monkeypatch.setattr(settings, "REFERENCES_JSON_PATH", mocked_path)

    # reference some_file.pdf should have None citation_key
    # we will update it to reda2023
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()
    assert jstore.references[0].citation_key is None

    client = TestClient(api)
    patch = {
        "source_filename": "some_file.pdf",
        "patch": {"data": {"citation_key": "reda2023"}}
    }
    response = client.post("/api/sidecar/update", json=patch)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
    }

    # reload from `mocked_path` to check that the update was successful
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # check that the citation key has been updated
    assert jstore.references[0].citation_key == "reda2023"


def test_references_delete(monkeypatch, tmp_path):
    # copy references.json to temp dir and mock settings.REFERENCES_JSON_PATH
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)
    mocked_path = tmp_path.joinpath("references.json")

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)
    monkeypatch.setattr(settings, "REFERENCES_JSON_PATH", mocked_path)

    # `some_file.pdf` should be in the references.json file
    # we will delete it
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()
    assert jstore.references[0].source_filename == "some_file.pdf"

    client = TestClient(api)
    request = {"source_filenames": ["some_file.pdf"]}
    response = client.post("/api/sidecar/delete", json=request)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
    }

    # reload from `mocked_path` to check that the update was successful
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # ensure that the reference was deleted
    for ref in jstore.references:
        assert ref.source_filename != "some_file.pdf"


def test_ai_rewrite_is_ok(monkeypatch, mock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", mock_call_model_is_ok)

    request = {"text": "This is a test"}
    response = client.post("/api/sidecar/rewrite", json=request)

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
    response = client.post("/api/sidecar/rewrite", json=request)

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
    response = client.post("/api/sidecar/completion", json=request)

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

def test_ai_completion_missing_required_request_params(monkeypatch, mock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", mock_call_model_is_ok)

    request = {"missing": "This is an invalid request"}
    response = client.post("/api/sidecar/completion", json=request)

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
    response = client.post("/api/sidecar/chat", json=request)

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

def test_ai_chat_missing_required_request_params(monkeypatch, mock_call_model_is_ok, tmp_path):
    monkeypatch.setattr(Chat, "call_model", mock_call_model_is_ok)

    # copy references.json to temp dir and mock settings.REFERENCES_JSON_PATH
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)
    mocked_path = tmp_path.joinpath("references.json")

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)
    monkeypatch.setattr(settings, "REFERENCES_JSON_PATH", mocked_path)

    request = {"missing": "This is an invalid request"}
    response = client.post("/api/sidecar/chat", json=request)

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
    response = client.post("/api/sidecar/search", json=request)

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

    client = TestClient(http.project_api)
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {}

    projects.create_project(user_id, project_id)

    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {project_id: str(tmp_path / user_id / project_id)}


def test_create_project(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    client = TestClient(http.project_api)

    response = client.post("/")

    assert response.status_code == 200
    assert len(response.json()) == 1

    # should create project with random uuid4
    project_id = list(response.json().keys())[0]
    assert isinstance(UUID(project_id), UUID)

    # should create project in user's home directory
    user_id = "user1"
    project_path = tmp_path / user_id / project_id
    assert response.json()[project_id] == str(project_path)
    assert project_path.exists()

    storage = projects.read_project_path_storage(user_id)
    assert project_id in storage


def test_get_project(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    client = TestClient(http.project_api)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_path = projects.create_project(user_id, project_id)

    # get the project
    response = client.get(f"/{project_id}")

    assert response.status_code == 200
    assert response.json() == {
        "project_id": project_id,
        "project_path": str(project_path),
        "filepaths": [],
    }


def test_delete_project(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    client = TestClient(http.project_api)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_path = projects.create_project(user_id, project_id)

    # delete the project
    response = client.delete(f"/{project_id}")

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

    client = TestClient(http.filesystem_api)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_path = projects.create_project(user_id, project_id)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{FIXTURES_DIR}/pdf/grobid-fails.pdf", "rb") as f:
        response = client.put(
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

    files_and_subdirs = projects.get_project_files(user_id, project_id)
    expected = [filepath.parent, filepath]
    assert sorted(files_and_subdirs) == sorted(expected)


def test_read_file(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    client = TestClient(http.filesystem_api)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_path = projects.create_project(user_id, project_id)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{FIXTURES_DIR}/pdf/grobid-fails.pdf", "rb") as f:
        response = client.put(
            f"/{project_id}/{filename}",
            files={"file": ("grobid-fails.pdf", f, "application/pdf")},
        )

    # read the file
    response = client.get(f"/{project_id}/{filename}")

    assert response.status_code == 200
    assert response.content == filepath.read_bytes()


def test_delete_file(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    client = TestClient(http.filesystem_api)

    # create a project
    user_id = "user1"
    project_id = "project1"
    project_path = projects.create_project(user_id, project_id)

    # create a file
    filename = "uploads/test.pdf"
    filepath = project_path / filename

    with open(f"{FIXTURES_DIR}/pdf/grobid-fails.pdf", "rb") as f:
        response = client.put(
            f"/{project_id}/{filename}",
            files={"file": ("grobid-fails.pdf", f, "application/pdf")},
        )

    # delete the file
    response = client.delete(f"/{project_id}/{filename}")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "File deleted",
        "filepath": str(filepath),
    }

    # check that the file was deleted
    assert not filepath.exists()

    files_and_subdirs = projects.get_project_files(user_id, project_id)
    expected = [filepath.parent]
    assert sorted(files_and_subdirs) == sorted(expected)