import json

from sidecar import rewrite
from sidecar.typing import RewriteRequest, TextCompletionRequest


def test_rewrite_is_ok(monkeypatch, mock_call_model_is_ok, capsys):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_ok)

    _ = rewrite.rewrite(RewriteRequest(text="This is a test"))
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output['status'] == "ok"
    assert output['message'] == ""
    assert len(output['choices']) == 1
    assert output['choices'][0]['index'] == 0
    assert output['choices'][0]['text'] == "This is a mocked response"


def test_rewrite_is_error(monkeypatch, mock_call_model_is_error, capsys):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_error)

    _ = rewrite.rewrite(RewriteRequest(text="This is a test"))
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output['status'] == "error"
    assert output['message'] == "This is a mocked error"
    assert len(output['choices']) == 0


def test_complete_text_is_ok(monkeypatch, mock_call_model_is_ok, capsys):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_ok)

    _ = rewrite.complete_text(TextCompletionRequest(text="This is a test"))
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output['status'] == "ok"
    assert output['message'] == ""
    assert len(output['choices']) == 1
    assert output['choices'][0]['index'] == 0
    assert output['choices'][0]['text'] == "This is a mocked response"


def test_complete_text_is_error(monkeypatch, mock_call_model_is_error, capsys):
    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model_is_error)

    _ = rewrite.complete_text(TextCompletionRequest(text="This is a test"))
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert output['status'] == "error"
    assert output['message'] == "This is a mocked error"
    assert len(output['choices']) == 0