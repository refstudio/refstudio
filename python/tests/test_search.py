from sidecar import search
import json
from sidecar.typing import SearchRequest, SearchResponse, S2SearchResult, ResponseStatus


def test_search(monkeypatch, capsys):
    def mock_search_paper(*args, **kwargs):
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

    monkeypatch.setattr(search.Searcher, "search_func", mock_search_paper)

    _ = search.search_s2(SearchRequest(query="any-query-string-you-like"))
    captured = capsys.readouterr()
    output = json.loads(captured.out)

    assert len(output["results"]) == 2
    assert output["results"][0]["title"] == "Sample Paper Title"
    assert output["results"][0]["authors"][0] == "author1"
    assert output["results"][0]["authors"][1] == "author2"
    assert output["results"][0]["authors"][2] == "author3"
    assert output["results"][1]["title"] == "Sample Paper Title 2"
    assert output["results"][1]["authors"][0] == "author1"
    assert output["results"][1]["authors"][1] == "author2"
