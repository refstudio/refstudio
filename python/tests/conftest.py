import pytest

from sidecar import projects


@pytest.fixture
def setup_project_path_storage(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    projects.create_project(user_id, project_id)
    return user_id, project_id


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


@pytest.fixture
def mock_search_paper(*args, **kwargs):
    from sidecar.typing import ResponseStatus, S2SearchResult, SearchResponse

    def mock_search_paper_response(*args, **kwargs):
        response = SearchResponse(
            status=ResponseStatus.OK,
            message="",
            results=[
                S2SearchResult(
                    title="Sample Paper Title",
                    abstract="Sample Abstract",
                    venue="Sample Venue",
                    year=2021,
                    paperId="sample-id-1",
                    citationCount=10,
                    openAccessPdf="https://sample1.pdf",
                    authors=["author1", "author2", "author3"],
                ),
                S2SearchResult(
                    title="Sample Paper Title 2",
                    abstract="Sample Abstract 2",
                    venue="Sample Venue 2",
                    year=2022,
                    paperId="sample-id-2",
                    citationCount=20,
                    openAccessPdf="https://sample2.pdf",
                    authors=["author1", "author2", "author3"],
                ),
            ],
        )
        return response
    
    return mock_search_paper_response