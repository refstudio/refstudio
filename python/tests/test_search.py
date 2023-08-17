import json

from sidecar import search
from sidecar.typing import SearchRequest


def test_search(monkeypatch, capsys, mock_search_paper):
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
