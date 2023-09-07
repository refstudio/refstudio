from pathlib import Path

from sidecar.ai.ranker import BM25Ranker
from sidecar.references import storage


def test_bm25_ranker(fixtures_dir):
    # the corpus is made up of two references
    # one reference is about Chicago
    # one reference is about baseball
    path_from_fixtures = f"{fixtures_dir}/data/references.json"
    fp = Path(__file__).parent.joinpath(path_from_fixtures)
    jstore = storage.JsonStorage(filepath=fp)
    jstore.load()

    ranker = BM25Ranker(storage=jstore)

    docs = ranker.get_top_n(query="Chicago", limit=2)
    assert len(docs) == 2
    assert isinstance(docs, list)

    # relevant docs should be about Chicago
    for chunk in docs:
        assert "chicago" in chunk.text.lower()

    docs = ranker.get_top_n(query="baseball", limit=2)
    assert len(docs) == 2
    assert isinstance(docs, list)

    # relevant docs should not be about Chicago
    for chunk in docs:
        assert "chicago" not in chunk.text.lower()
