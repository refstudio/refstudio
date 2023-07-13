import json

from sidecar import rewrite
from sidecar.typing import RewriteRequest, TextCompletionRequest


def test_summarize(monkeypatch, capsys):
    def mock_call_model(*args, **kwargs):
        response = {
            "choices": [
                {
                "finish_reason": "stop",
                "index": 0,
                "message": {
                    "content": "This is a mocked response",
                    "role": "assistant"
                }
                }
            ],
            "created": 1685588892,
            "id": "chatcmpl-somelonghashedstring",
            "model": "gpt-3.5-turbo-0301",
            "object": "chat.completion",
            "usage": {
                "completion_tokens": 121,
                "prompt_tokens": 351,
                "total_tokens": 472
            }
        }
        return response

    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model)

    _ = rewrite.summarize(RewriteRequest(text="This is a test"))
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert len(output) == 1
    assert output[0]["index"] == 0
    assert output[0]["text"] == "This is a mocked response"


def test_complete_text(monkeypatch, capsys):
    def mock_call_model(*args, **kwargs):
        response = {
            "choices": [
                {
                "finish_reason": "stop",
                "index": 0,
                "message": {
                    "content": "This is a mocked response",
                    "role": "assistant"
                }
                }
            ],
            "created": 1685588892,
            "id": "chatcmpl-somelonghashedstring",
            "model": "gpt-3.5-turbo-0301",
            "object": "chat.completion",
            "usage": {
                "completion_tokens": 121,
                "prompt_tokens": 351,
                "total_tokens": 472
            }
        }
        return response

    monkeypatch.setattr(rewrite.Rewriter, "call_model", mock_call_model)

    _ = rewrite.complete_text(TextCompletionRequest(text="This is a test"))
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert len(output) == 1
    assert output[0]["index"] == 0
    assert output[0]["text"] == "This is a mocked response"