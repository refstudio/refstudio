from typing import AsyncGenerator

import pytest
from sidecar.ai import chat
from sidecar.ai.schemas import ChatRequest
from sidecar.settings.service import default_settings


@pytest.mark.asyncio
async def test_chat_ask_question_is_ok(
    monkeypatch, amock_call_model_is_ok, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", amock_call_model_is_ok)

    user_settings = default_settings()
    user_settings.api_key = "1234"

    response = await chat.ask_question(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
        user_settings=user_settings,
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
async def test_chat_ask_question_is_unhandled_error(
    monkeypatch, amock_call_model_is_unhandled_error, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", amock_call_model_is_unhandled_error)

    user_settings = default_settings()
    user_settings.api_key = "1234"

    response = await chat.ask_question(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
        user_settings=user_settings,
    )
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == chat.get_unhandled_error_message()
    assert len(output["choices"]) == 0


@pytest.mark.asyncio
async def test_chat_yield_response_is_ok(
    monkeypatch, amock_call_model_is_stream, setup_project_references_json
):
    monkeypatch.setattr(chat.Chat, "call_model", amock_call_model_is_stream)

    user_settings = default_settings()
    user_settings.api_key = "1234"

    response = await chat.yield_response(
        request=ChatRequest(text="This is a question about something"),
        project_id="project1",
        user_settings=user_settings,
    )
    assert isinstance(response, AsyncGenerator)

    result = ""
    async for chunk in response:
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
    assert isinstance(response, AsyncGenerator)

    result = ""
    async for chunk in response:
        result += chunk

    expected = ""
    async for chunk in chat.yield_error_message(chat.get_missing_references_message):
        expected += chunk

    assert result == expected
