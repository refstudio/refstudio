import json
from pathlib import Path

from sidecar import chat, settings

from .test_ingest import _copy_fixture_to_temp_dir


def test_chat_ask_question(monkeypatch, capsys, tmp_path):
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
    
    # copy references.json to temp dir and mock settings.REFERENCES_JSON_PATH
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)
    mocked_path = tmp_path.joinpath("references.json")

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)
    monkeypatch.setattr(settings, "REFERENCES_JSON_PATH", mocked_path)

    _ = chat.ask_question(
        input_text="This is a question about something",
        n_choices=1
    )
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert len(output) == 1
    assert output[0]["index"] == 0
    assert output[0]["text"] == "This is a mocked response"
