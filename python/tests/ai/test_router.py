from fastapi.testclient import TestClient
from sidecar.ai.chat import Chat
from sidecar.ai.rewrite import Rewriter
from sidecar.api import api

client = TestClient(api)


def test_ai_rewrite_is_ok(monkeypatch, amock_call_model_is_ok):
    monkeypatch.setattr(Rewriter, "call_model", amock_call_model_is_ok)

    request = {"text": "This is a test"}
    response = client.post("/api/ai/rewrite", json=request)

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
    response = client.post("/api/ai/rewrite", json=request)

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

    request = {"text": "This is a test"}
    response = client.post("/api/ai/completion", json=request)

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
    response = client.post("/api/ai/completion", json=request)

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


def test_ai_chat_is_ok(
    monkeypatch,
    amock_call_model_is_ok,
    setup_project_references_json,
    create_settings_json,
):
    monkeypatch.setattr(Chat, "call_model", amock_call_model_is_ok)

    project_id = "project1"

    request = {"text": "This is a test"}
    response = client.post(f"/api/ai/{project_id}/chat", json=request)

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
    monkeypatch, amock_call_model_is_ok, setup_project_references_json
):
    monkeypatch.setattr(Chat, "call_model", amock_call_model_is_ok)

    project_id = "project1"
    request = {"missing": "This is an invalid request"}
    response = client.post(f"/api/ai/{project_id}/chat", json=request)

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


def test_ai_chat_is_streaming(
    monkeypatch,
    amock_call_model_is_stream,
    setup_project_references_json,
    create_settings_json,
):
    monkeypatch.setattr(Chat, "call_model", amock_call_model_is_stream)

    project_id = "project1"

    request = {"text": "This is a test", "stream": True}
    response = client.post(f"/api/ai/{project_id}/chat_stream", json=request)

    assert response.status_code == 200
    assert response.content == b"data: This is a mocked streaming response\n\n"
