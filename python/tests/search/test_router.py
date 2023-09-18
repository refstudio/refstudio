from fastapi.testclient import TestClient
from sidecar.api import api
from sidecar.search.service import Searcher

client = TestClient(api)


def test_search_s2_is_ok(monkeypatch, mock_search_paper):
    monkeypatch.setattr(Searcher, "search_func", mock_search_paper)

    params = {"query": "any-query-string-you-like"}
    response = client.get("/api/search/s2", params=params)

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
                "publicationDate": "01-01-2021",
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
                "publicationDate": "01-01-2021",
                "paperId": "sample-id-2",
                "citationCount": 20,
                "openAccessPdf": "https://sample2.pdf",
                "authors": ["author1", "author2", "author3"],
            },
        ],
    }
