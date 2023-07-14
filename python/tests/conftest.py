import pytest


@pytest.fixture
def mock_call_model_is_ok(*args, **kwargs):
    def mock_call_model_response(*args, **kwargs):
        return {
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
    return mock_call_model_response


@pytest.fixture
def mock_call_model_is_error(*args, **kwargs):
    def mock_call_model_response(*args, **kwargs):
        raise Exception("This is a mocked error")
    return mock_call_model_response