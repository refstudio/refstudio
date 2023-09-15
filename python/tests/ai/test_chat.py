from types import GeneratorType

from sidecar.ai import chat
from sidecar.ai.schemas import ChatRequest


def test_chat_ask_question_is_ok(
    monkeypatch, mock_call_model_is_ok, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", mock_call_model_is_ok)

    response = chat.ask_question(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    output = response.dict()

    assert output["status"] == "ok"
    assert output["message"] == ""
    assert len(output["choices"]) == 1
    assert output["choices"][0]["index"] == 0


def test_chat_yield_response_is_ok(
    monkeypatch, mock_call_model_is_stream, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", mock_call_model_is_stream)

    response = chat.yield_response(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    assert isinstance(response, GeneratorType)

    result = ""
    for chunk in response:
        result += chunk

    assert result == "This is a mocked streaming response"


def test_chat_ask_question_is_openai_error(
    monkeypatch, mock_call_model_is_error, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", mock_call_model_is_error)

    response = chat.ask_question(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == "This is a mocked error"
    assert len(output["choices"]) == 0
