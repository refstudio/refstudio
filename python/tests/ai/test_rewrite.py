from sidecar.ai import rewrite
from sidecar.ai.schemas import RewriteRequest, TextCompletionRequest


def test_rewrite_is_ok(monkeypatch, mock_call_model_is_ok):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_ok)

    response = rewrite.rewrite(RewriteRequest(text="This is a test"))
    output = response.dict()

    assert output["status"] == "ok"
    assert output["message"] == ""
    assert len(output["choices"]) == 1
    assert output["choices"][0]["index"] == 0
    assert output["choices"][0]["text"] == "This is a mocked response"


def test_rewrite_is_error(monkeypatch, mock_call_model_is_error):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_error)

    response = rewrite.rewrite(RewriteRequest(text="This is a test"))
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == "This is a mocked error"
    assert len(output["choices"]) == 0


def test_complete_text_is_ok(monkeypatch, mock_call_model_is_ok):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_ok)

    response = rewrite.complete_text(TextCompletionRequest(text="This is a test"))
    output = response.dict()

    assert output["status"] == "ok"
    assert output["message"] == ""
    assert len(output["choices"]) == 1
    assert output["choices"][0]["index"] == 0
    assert output["choices"][0]["text"] == "This is a mocked response"


def test_complete_text_is_error(monkeypatch, mock_call_model_is_error):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_error)

    response = rewrite.complete_text(TextCompletionRequest(text="This is a test"))
    output = response.dict()

    assert output["status"] == "error"
    assert output["message"] == "This is a mocked error"
    assert len(output["choices"]) == 0
