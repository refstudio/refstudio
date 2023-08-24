from rank_bm25 import BM25Plus
from sidecar.storage import JsonStorage
from sidecar.typing import Chunk


class BM25Ranker:
    def __init__(self, storage: JsonStorage):
        self.storage = storage
        self.ranker = BM25Plus(self.storage.tokenized_corpus)

    def get_top_n(self, query: str, limit: int = 5) -> list[Chunk]:
        """
        Rank documents based on input text

        Parameters
        ----------
        input_text : str
            Input text to be used as query
        limit : int, default 5
            Number of documents to return

        Returns
        -------
        docs : list[Chunk]
        """
        tokenized_query = query.lower().split()
        docs = self.ranker.get_top_n(tokenized_query, self.storage.chunks, n=limit)
        return docs
