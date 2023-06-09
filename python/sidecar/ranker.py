from rank_bm25 import BM25Okapi
from sidecar.storage import JsonStorage


class BM25Ranker:
    def __init__(self, storage: JsonStorage):
        self.storage = storage
        self.ranker = BM25Okapi(self.storage.tokenized_corpus)
    
    def get_top_n(self, query: str, limit: int = 5) -> list:
        """
        Rank documents based on input text
        :param input_text: str
        :param limit: int
        :return: list
        """
        tokenized_query = query.split()
        docs = self.ranker.get_top_n(tokenized_query, self.storage.corpus, n=limit)
        return docs
    