import json
from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from openai.error import AuthenticationError
from sidecar import config
from sidecar.api import api
from sidecar.projects import service as projects_service
from sidecar.references import storage
from sidecar.settings import service as settings_service
from sidecar.settings.schemas import ModelProvider

from .helpers import _copy_fixture_to_temp_dir


@pytest.fixture
def fixtures_dir():
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def setup_project_storage(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)
    projects_service.create_project(user_id, project_id, project_name)
    return user_id, project_id


@pytest.fixture
def setup_project_references_json(monkeypatch, tmp_path, fixtures_dir):
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)

    projects_service.create_project(user_id, project_id, project_name)
    write_path = storage.get_references_json_path(user_id, project_id)

    # copy references.json fixtures to temp dir for tests
    test_file = f"{fixtures_dir}/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, write_path)
    return write_path


@pytest.fixture
def setup_project_with_uploads(monkeypatch, tmp_path, fixtures_dir):
    user_id = "user1"
    project_id = "project1"
    project_name = "project1name"
    monkeypatch.setattr(projects_service, "WEB_STORAGE_URL", tmp_path)

    projects_service.create_project(user_id, project_id, project_name)
    project_path = projects_service.get_project_path(user_id, project_id)

    client = TestClient(api)
    client.post(f"/fs/{project_id}/uploads", files={"file": ("file1.txt", "content")})

    # create a file
    filename = "uploads/test.pdf"
    project_path / filename

    with open(f"{fixtures_dir}/pdf/test.pdf", "rb") as f:
        _ = client.put(
            f"/{project_id}/{filename}",
            files={"file": ("test.pdf", f, "application/pdf")},
        )


@pytest.fixture
def setup_uploaded_reference_pdfs(monkeypatch, tmp_path, fixtures_dir):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    _ = projects_service.create_project(user_id, project_id)

    # create a file
    filename = "uploads/test.pdf"

    client = TestClient(api)

    with open(f"{fixtures_dir}/pdf/test.pdf", "rb") as f:
        _ = client.put(
            f"/fs/{project_id}/{filename}",
            files={"file": ("test.pdf", f, "application/pdf")},
        )


@pytest.fixture
def mock_url_pdf_response(fixtures_dir):
    def mock_url_pdf_response(*args, **kwargs):
        class MockResponse:
            @property
            def content(self):
                with open(f"{fixtures_dir}/pdf/test.pdf", "rb") as f:
                    return f.read()

            @property
            def status_code(self):
                return 200

            @property
            def ok(self):
                return True

            @property
            def headers(self):
                return {"content-type": "application/pdf"}

        return MockResponse()

    return mock_url_pdf_response


@pytest.fixture
def mock_url_pdf_response_error(fixtures_dir):
    def mock_url_pdf_response(*args, **kwargs):
        class MockResponse:
            @property
            def content(self):
                with open(f"{fixtures_dir}/pdf/test.pdf", "rb") as f:
                    return f.read()

            @property
            def status_code(self):
                return 403

            @property
            def ok(self):
                return False

            @property
            def headers(self):
                return {"content-type": "application/pdf"}

        return MockResponse()

    return mock_url_pdf_response


@pytest.fixture
def create_settings_json(monkeypatch, tmp_path, request):
    monkeypatch.setattr(config, "WEB_STORAGE_URL", tmp_path)

    user_id = "user1"
    filepath = settings_service.make_settings_json_path(user_id)

    settings_service.initialize_settings_for_user(user_id)

    defaults = settings_service.default_settings()
    defaults.model_provider = ModelProvider.OPENAI
    defaults.api_key = "1234"

    with open(filepath, "w") as f:
        json.dump(defaults.dict(), f)

    def teardown():
        filepath.unlink()

    request.addfinalizer(teardown)


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
                        "role": "assistant",
                    },
                }
            ],
            "created": 1685588892,
            "id": "chatcmpl-somelonghashedstring",
            "model": "gpt-3.5-turbo-0301",
            "object": "chat.completion",
            "usage": {
                "completion_tokens": 121,
                "prompt_tokens": 351,
                "total_tokens": 472,
            },
        }

    return mock_call_model_response


@pytest.fixture
def amock_call_model_is_ok(*args, **kwargs):
    async def mock_call_model_response(*args, **kwargs):
        return {
            "choices": [
                {
                    "finish_reason": "stop",
                    "index": 0,
                    "message": {
                        "content": "This is a mocked response",
                        "role": "assistant",
                    },
                }
            ],
            "created": 1685588892,
            "id": "chatcmpl-somelonghashedstring",
            "model": "gpt-3.5-turbo-0301",
            "object": "chat.completion",
            "usage": {
                "completion_tokens": 121,
                "prompt_tokens": 351,
                "total_tokens": 472,
            },
        }

    return mock_call_model_response


@pytest.fixture
def mock_call_model_is_stream(*args, **kwargs):
    def mock_call_model_response(*args, **kwargs):
        yield {
            "choices": [
                {
                    "delta": {
                        "content": "This is a mocked streaming response",
                    }
                }
            ]
        }

    return mock_call_model_response


@pytest.fixture
def mock_call_model_is_error(*args, **kwargs):
    def mock_call_model_response(*args, **kwargs):
        raise Exception("This is a mocked error")

    return mock_call_model_response


@pytest.fixture
def mock_call_model_is_authentication_error(*args, **kwargs):
    def mock_call_model_response(*args, **kwargs):
        raise AuthenticationError("This is an authentication error")

    return mock_call_model_response


@pytest.fixture
def amock_call_model_is_error(*args, **kwargs):
    async def mock_call_model_response(*args, **kwargs):
        raise Exception("This is a mocked error")

    return mock_call_model_response


@pytest.fixture
def mock_search_paper(*args, **kwargs):
    from sidecar.search.schemas import S2SearchResult, SearchResponse
    from sidecar.typing import ResponseStatus

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
                    publicationDate=datetime(2021, 1, 1),
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
                    publicationDate=datetime(2022, 1, 1),
                    paperId="sample-id-2",
                    citationCount=20,
                    openAccessPdf="https://sample2.pdf",
                    authors=["author1", "author2", "author3"],
                ),
            ],
        )
        return response

    return mock_search_paper_response
