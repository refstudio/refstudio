from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sidecar import http, projects, search

from .test_ingest import FIXTURES_DIR, _copy_fixture_to_temp_dir

search_client = TestClient(http.search_api)
references_client = TestClient(http.references_api)
filesystem_client = TestClient(http.filesystem_api)


@pytest.fixture
def setup_uploaded_reference_pdfs(monkeypatch, tmp_path):
    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)

    # create a project
    user_id = "user1"
    project_id = "project1"
    _ = projects.create_project(user_id, project_id)

    # create a file
    filename = "uploads/test.pdf"

    with open(f"{FIXTURES_DIR}/pdf/test.pdf", "rb") as f:
        _ = filesystem_client.put(
            f"/{project_id}/{filename}",
            files={"file": ("test.pdf", f, "application/pdf")},
        )


def test_list_references_should_return_empty_list(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    _ = projects.create_project(user_id, project_id, project_name="foo")

    # .storage/references.json does not exist as no references have been ingested
    response = references_client.get(f"/{project_id}")
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_list_references_should_return_references(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    response = references_client.get(f"/{project_id}")
    assert response.status_code == 200
    assert len(response.json()) == len(jstore.references)
    assert len(response.json()) != 0


def test_get_reference(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # get the first reference
    ref = jstore.references[0]

    response = references_client.get(f"/{project_id}/{ref.id}")
    assert response.status_code == 200
    assert response.json() == ref.dict()


def test_references_update(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # reference should have None citation_key
    # we will update it to reda2023
    ref = jstore.references[0]
    assert ref.citation_key is None

    patch = {"data": {"citation_key": "reda2023"}}
    response = references_client.patch(f"/{project_id}/{ref.id}", json=patch)

    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    # reload from `mocked_path` to check that the update was successful
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # check that the citation key has been updated
    assert jstore.references[0].citation_key == "reda2023"


def test_references_bulk_delete(monkeypatch, tmp_path):
    user_id = "user1"
    project_id = "project1"

    monkeypatch.setattr(projects.settings, "WEB_STORAGE_URL", tmp_path)
    project_path = projects.create_project(user_id, project_id, project_name="foo")
    mocked_path = project_path / ".storage" / "references.json"

    # copy references.json to mocked storage path
    test_file = "fixtures/data/references.json"
    path_to_test_file = Path(__file__).parent.joinpath(test_file)

    _copy_fixture_to_temp_dir(path_to_test_file, mocked_path)

    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    assert len(jstore.references) == 2

    ids = [ref.id for ref in jstore.references]
    request = {"reference_ids": ids}

    response = references_client.post(f"/{project_id}/bulk_delete", json=request)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
    }

    # reload from `mocked_path` to check that the update was successful
    jstore = JsonStorage(filepath=mocked_path)
    jstore.load()

    # ensure that the reference was deleted
    assert len(jstore.references) == 0


def test_search_s2_is_ok(monkeypatch, mock_search_paper):
    monkeypatch.setattr(search.Searcher, "search_func", mock_search_paper)

    params = {"query": "any-query-string-you-like"}
    response = search_client.get("/s2", params=params)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "message": "",
        "results": [
            {
                "title": "Sample Paper Title",
                "abstract": "Sample Abstract",
                "venue": "Sample Venue",
                "year": 2021,
                "paperId": "sample-id-1",
                "citationCount": 10,
                "openAccessPdf": "https://sample1.pdf",
                "authors": ["author1", "author2", "author3"],
            },
            {
                "title": "Sample Paper Title 2",
                "abstract": "Sample Abstract 2",
                "venue": "Sample Venue 2",
                "year": 2022,
                "paperId": "sample-id-2",
                "citationCount": 20,
                "openAccessPdf": "https://sample2.pdf",
                "authors": ["author1", "author2", "author3"],
            },
        ],
    }
