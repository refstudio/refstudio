from sidecar import search

def test_search(monkeypatch):
    def mock_search_paper(*args, **kwargs):
        response = [
            {
                "title": "Sample Paper Title",
                "abstract": "Sample Abstract",
                "venue": "Sample Venue",
                "year": 2021,
                "paperId": "sample-id-1",
                "citationCount": 10,
                "openAccessPdf": "https://sample.org",
                "authors": [
                    {"authorId": "auth-id-1", "name": "Sample Author Name 1"},
                    {"authorId": "auth-id-2", "name": "Sample Author Name 2"},
                ]
            },
            {
                "title": "Sample Paper Title 2",
                "abstract": "Sample Abstract 2",
                "venue": "Sample Venue 2",
                "year": 2022,
                "paperId": "sample-id-2",
                "citationCount": 20,
                "openAccessPdf": "https://sample.org/2",
                "authors": [
                    {"authorId": "auth-id-3", "name": "Sample Author Name 3"},
                    {"authorId": "auth-id-4", "name": "Sample Author Name 4"},
                ]
            },
        ]
        return response

    monkeypatch.setattr(search.Search, "search_paper", mock_search_paper)

    searcher = search.Searcher()
    result = searcher.s2.search_paper("any-query-string-you-like")

    assert len(result) == 2
    assert result[0]["title"] == "Sample Paper Title"
    assert result[0]["authors"][0]["name"] == "Sample Author Name 1"
    assert result[0]["authors"][1]["name"] == "Sample Author Name 2"
    assert result[1]["title"] == "Sample Paper Title 2"
    assert result[1]["authors"][0]["name"] == "Sample Author Name 3"
    assert result[1]["authors"][1]["name"] == "Sample Author Name 4"