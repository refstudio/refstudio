import pytest
from sidecar.ai import rewrite
from sidecar.ai.schemas import (
    RewriteRequest,
    TextCompletionChoice,
    TextCompletionRequest,
)
from sidecar.settings.service import ModelProvider, default_settings


@pytest.mark.asyncio
async def test_rewrite_is_ok(monkeypatch, amock_call_model_is_ok):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", amock_call_model_is_ok)

    user_settings = default_settings()
    user_settings.model_provider = ModelProvider.OPENAI
    user_settings.api_key = "mocked-api-key"
    user_settings.model = "gpt-3.5-turbo"

    response = await rewrite.rewrite(
        RewriteRequest(text="This is a test"), user_settings=user_settings
    )
    output = response.dict()

    assert output["status"] == "ok"
    assert output["message"] == ""
    assert len(output["choices"]) == 1
    assert output["choices"][0]["index"] == 0
    assert output["choices"][0]["text"] == "This is a mocked response"


@pytest.mark.asyncio
async def test_rewrite_is_error(monkeypatch, mock_call_model_is_error):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_error)

    response = await rewrite.rewrite(RewriteRequest(text="This is a test"))
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == "This is a mocked error"
    assert len(output["choices"]) == 0


@pytest.mark.asyncio
async def test_complete_text_is_ok(monkeypatch, amock_call_model_is_ok):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", amock_call_model_is_ok)

    response = await rewrite.complete_text(TextCompletionRequest(text="This is a test"))
    output = response.dict()

    assert output["status"] == "ok"
    assert output["message"] == ""
    assert len(output["choices"]) == 1
    assert output["choices"][0]["index"] == 0
    assert output["choices"][0]["text"] == "This is a mocked response"


@pytest.mark.asyncio
async def test_complete_text_is_error(monkeypatch, mock_call_model_is_error):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_error)

    response = await rewrite.complete_text(TextCompletionRequest(text="This is a test"))
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == "This is a mocked error"
    assert len(output["choices"]) == 0


def test_trim_completion_prefix_from_choices():
    # test 1: prefix is a single sentence and response includes part of the sentence
    test_prefix = "This is a prefix and we have "
    choices = [
        TextCompletionChoice(
            index=0, text="This is a prefix and we have inserted some text."
        ),
        TextCompletionChoice(
            index=1, text="This is a prefix and we have added some text."
        ),
        TextCompletionChoice(index=2, text="updated some text."),
    ]
    trimmed_choices = rewrite.trim_completion_prefix_from_choices(test_prefix, choices)
    assert len(trimmed_choices) == 3
    assert trimmed_choices[0].text == "inserted some text."
    assert trimmed_choices[1].text == "added some text."
    assert trimmed_choices[2].text == "updated some text."

    # test 2: prefix is many sentences and response includes part of the last sentence
    test_prefix = (
        "This is a very long prefix. But we only append to the last piece. "
        "The last piece is "
    )
    choices = [
        TextCompletionChoice(index=0, text="The last piece is part of the prefix."),
        TextCompletionChoice(index=1, text="The last piece is part of the test."),
        TextCompletionChoice(index=2, text="something else."),
    ]
    trimmed_choices = rewrite.trim_completion_prefix_from_choices(test_prefix, choices)
    assert len(trimmed_choices) == 3
    assert trimmed_choices[0].text == "part of the prefix."
    assert trimmed_choices[1].text == "part of the test."
    assert trimmed_choices[2].text == "something else."

    # test 3: prefix is many sentences and response includes the entire prefix
    test_prefix = (
        "This is a very long prefix. But we only append to the last piece. "
        "The last piece is "
    )
    choices = [
        TextCompletionChoice(
            index=0,
            text=(
                "This is a very long prefix. But we only append to the last piece. "
                "The last piece is part of the prefix."
            ),
        ),
        TextCompletionChoice(
            index=1,
            text=(
                "This is a very long prefix. But we only append to the last piece. "
                "The last piece is part of the test."
            ),
        ),
        TextCompletionChoice(
            index=2,
            text=(
                "This is a very long prefix. But we only append to the last piece. "
                "The last piece is something else."
            ),
        ),
    ]
    trimmed_choices = rewrite.trim_completion_prefix_from_choices(test_prefix, choices)
    assert len(trimmed_choices) == 3
    assert trimmed_choices[0].text == "part of the prefix."
    assert trimmed_choices[1].text == "part of the test."
    assert trimmed_choices[2].text == "something else."
