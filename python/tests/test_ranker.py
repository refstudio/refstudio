from sidecar import storage
from sidecar.ranker import BM25Ranker


def test_bm25_ranker():
    # the corpus is made up of two references
    # one reference is about Chicago
    # one reference is about baseball
    fp = "tests/fixtures/data/references.json"
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()

    ranker = BM25Ranker(storage=jstore)

    docs = ranker.get_top_n(query="Chicago", limit=2)
    assert len(docs) == 2
    assert isinstance(docs, list)

    # relevant docs should be about Chicago
    for doc in docs:
        assert "chicago" in doc.lower()

    docs = ranker.get_top_n(query="baseball", limit=2)
    assert len(docs) == 2
    assert isinstance(docs, list)

    # relevant docs should not be about Chicago
    for doc in docs:
        assert "chicago" not in doc.lower()

