import hashlib
import os
import sys
from typing import List

from .typing import Chunk

MODEL_FOR_EMBEDDINGS = "sentence-transformers/all-MiniLM-L6-v2"


def get_word_count(text: str) -> int:
    return len(text.strip().split(" "))


def get_filename_md5(filename: str) -> str:
    """
    Get the MD5 hash of a filename
    :param filename: str
    :return: str
    """
    return hashlib.md5(filename.encode()).hexdigest()


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Chunk]:
    """
    Chunk text into smaller pieces for embedding
    :param text:
    :param chunk_size:
    :param chunk_overlap:
    :return:
    """
    if not text:
        return []

    if len(text) < chunk_size:
        return [Chunk(text=text)]

    chunks = []
    for i in range(0, len(text), chunk_size - chunk_overlap):
        chunks.append(
            Chunk(
                text=text[i:i + chunk_size],
            )
        )
    return chunks


def embed_text(text: List[str]) -> List[float]:
    """
    Embed text using sentence-transformers
    :param text:
    :return:
    """
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(MODEL_FOR_EMBEDDINGS)
    return model.encode(text)


class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout.close()
        sys.stdout = self._original_stdout
