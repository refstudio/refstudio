import json

from sidecar import chat, storage


def test_chat_ask_question(monkeypatch, capsys):
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
    
    monkeypatch.setattr(chat.Chat, "call_model", mock_call_model)

    _ = chat.ask_question(
        input_text="This is a question about something",
        n_options=1,
        storage_path="tests/fixtures/data/references.json"
    )
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert len(output) == 1
    assert output[0]["index"] == 0
    assert output[0]["text"] == "This is a mocked response"
