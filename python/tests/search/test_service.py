from sidecar.search.service import Searcher, search_s2


def test_search(monkeypatch, mock_search_paper):
    monkeypatch.setattr(Searcher, "search_func", mock_search_paper)

    response = search_s2(query="any-query-string-you-like")
    output = response.dict()

    assert len(output["results"]) == 2
    assert output["results"][0]["title"] == "Sample Paper Title"
    assert output["results"][0]["authors"][0] == "author1"
    assert output["results"][0]["authors"][1] == "author2"
    assert output["results"][0]["authors"][2] == "author3"
    assert output["results"][1]["title"] == "Sample Paper Title 2"
    assert output["results"][1]["authors"][0] == "author1"
    assert output["results"][1]["authors"][1] == "author2"
