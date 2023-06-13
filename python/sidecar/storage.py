import json

from sidecar import typing


class JsonStorage:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.references = []
        self.corpus = []
        self.tokenized_corpus = []

    def load(self):
        with open(self.filepath, 'r') as f:
            data = json.load(f)

        for item in data:
            for k, v in item.items():
                if k == "authors":
                    authors = [typing.Author(**a) for a in v]
                elif k == "chunks":
                    chunks = [typing.Chunk(**c) for c in v]
            ref = typing.Reference(**item)
            ref.authors = authors
            ref.chunks = chunks
            self.references.append(ref)
        self.create_corpus()
    
    def create_corpus(self):
        for ref in self.references:
            for chunk in ref.chunks:
                self.corpus.append(chunk.text)
                self.tokenized_corpus.append(chunk.text.lower().split())