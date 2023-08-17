from pathlib import Path

from fastapi.testclient import TestClient
from sidecar import search, settings
from sidecar.chat import Chat
from sidecar.rewrite import Rewriter
from sidecar.storage import JsonStorage
from web import api

from .test_ingest import _copy_fixture_to_temp_dir

client = TestClient(api)


def test_sidecar_index():
    response = client.get("/api/sidecar")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World from the Sidecar API"}


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
    response = client.post("/api/sidecar/references/update", json=patch)

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
    response = client.post("/api/sidecar/references/delete", json=request)

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
    response = client.post("/api/sidecar/ai/rewrite", json=request)

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
    response = client.post("/api/sidecar/ai/rewrite", json=request)

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
    response = client.post("/api/sidecar/ai/completion", json=request)

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
    response = client.post("/api/sidecar/ai/completion", json=request)

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
    response = client.post("/api/sidecar/ai/chat", json=request)

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
    response = client.post("/api/sidecar/ai/chat", json=request)

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
    response = client.post("/api/sidecar/search/s2", json=request)

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