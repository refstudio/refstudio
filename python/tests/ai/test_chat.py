from types import GeneratorType

import pytest
from sidecar.ai import chat
from sidecar.ai.schemas import ChatRequest


@pytest.mark.asyncio
async def test_chat_ask_question_is_ok(
    monkeypatch, amock_call_model_is_ok, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", amock_call_model_is_ok)

    response = await chat.ask_question(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    output = response.dict()

    assert output["status"] == "ok"
    assert output["message"] == ""
    assert len(output["choices"]) == 1
    assert output["choices"][0]["index"] == 0


@pytest.mark.asyncio
async def test_chat_ask_question_is_missing_references(
    monkeypatch, amock_call_model_is_ok, setup_project_references_empty
):
    response = await chat.ask_question(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == chat.get_missing_references_message()
    assert len(output["choices"]) == 0


@pytest.mark.asyncio
async def test_chat_ask_question_is_openai_error(
    monkeypatch, amock_call_model_is_error, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", amock_call_model_is_error)

    response = await chat.ask_question(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == "This is a mocked error"
    assert len(output["choices"]) == 0


@pytest.mark.asyncio
async def test_chat_yield_response_is_ok(
    monkeypatch, amock_call_model_is_stream, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", amock_call_model_is_stream)

    response = await chat.yield_response(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    assert isinstance(response, GeneratorType)

    result = ""
    for chunk in response:
        result += chunk

    assert result == "data: This is a mocked streaming response\n\n"


@pytest.mark.asyncio
async def test_chat_yield_response_is_missing_references(
    monkeypatch, amock_call_model_is_stream, setup_project_references_empty
):
    response = await chat.yield_response(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    assert isinstance(response, GeneratorType)

    result = ""
    for chunk in response:
        result += chunk

    expected = ""
    for chunk in chat.yield_missing_references_response():
        expected += chunk

    assert result == expected


@pytest.mark.asyncio
async def test_chat_yield_response_is_openai_error(
    monkeypatch, amock_call_model_is_authentication_error, setup_project_references_json
):
    monkeypatch.setattr(
        chat.Chat, "call_model", amock_call_model_is_authentication_error
    )

    response = await chat.yield_response(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
    )
    assert isinstance(response, GeneratorType)

    result = ""
    for chunk in response:
        result += chunk

    expected = (
        "data: It looks like you forgot to provide an API key! "
        "Please add one in the settings menu by clicking the gear icon in the "
        "lower left corner of the screen.\n\n"
    )
    assert result == expected
