from pathlib import Path

from fastapi.testclient import TestClient
from sidecar import config
from sidecar.ai.chat import Chat
from sidecar.ai.rewrite import Rewriter
from sidecar.api import api
from sidecar.projects import service as projects_service
from sidecar.projects.service import create_project

from ..helpers import _copy_fixture_to_temp_dir

client = TestClient(api)


def test_ai_rewrite_is_ok(monkeypatch, amock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", amock_call_model_is_ok)

    params = {"user_id": "user1"}
    request = {"text": "This is a test"}
    response = client.post("/api/ai/rewrite", params=params, json=request)

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

    params = {"user_id": "user1"}
    request = {"missing": "This is an invalid request"}
    response = client.post("/api/ai/rewrite", params=params, json=request)

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


def test_ai_completion_is_ok(monkeypatch, amock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", amock_call_model_is_ok)

    params = {"user_id": "user1"}
    request = {"text": "This is a test"}
    response = client.post("/api/ai/completion", params=params, json=request)

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

    params = {"user_id": "user1"}
    request = {"missing": "This is an invalid request"}
    response = client.post("/api/ai/completion", params=params, json=request)

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


def test_ai_chat_is_ok(monkeypatch, mock_call_model_is_ok, tmp_path, fixtures_dir):
    monkeypatch.setattr(Chat, "call_model", mock_call_model_is_ok)

    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)
    project = create_project(user_id, project_id, project_name="foo")
    mocked_path = Path(project.path) / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = f"{fixtures_dir}/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    params = {"user_id": user_id}
    request = {"text": "This is a test"}
    response = client.post(f"/api/ai/{project_id}/chat", params=params, json=request)

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
    monkeypatch, mock_call_model_is_ok, tmp_path, fixtures_dir
):
    monkeypatch.setattr(Chat, "call_model", mock_call_model_is_ok)

    # copy references.json to temp dir and mock settings.REFERENCES_JSON_PATH
    test_file = f"{fixtures_dir}/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)
    mocked_path = tmp_path.joinpath("references.json")

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)
    monkeypatch.setattr(config, "REFERENCES_JSON_PATH", mocked_path)

    project_id = "project1"
    params = {"user_id": "user1"}
    request = {"missing": "This is an invalid request"}
    response = client.post(f"/api/ai/{project_id}/chat", params=params, json=request)

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
