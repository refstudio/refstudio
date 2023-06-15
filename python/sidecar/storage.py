import json
import logging
import os

from sidecar import typing

logging.root.setLevel(logging.NOTSET)

logger = logging.getLogger(__name__)
handler = logging.FileHandler(
    os.path.join(
        os.environ.get("SIDECAR_LOG_DIR", "/tmp"), "refstudio-sidecar.log"
    )
)
handler.setLevel(logging.INFO)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

logger.addHandler(handler)
logger.disabled = os.environ.get("SIDECAR_ENABLE_LOGGING", "false").lower() == "true"


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

    def save(self):
        """
        Save the references to the storage file as JSON.
        """
        contents = [ref.dict() for ref in self.references]
        with open(self.filepath, 'w') as f:
            json.dump(contents, f, indent=2)
    
    def update(self, target: typing.Reference):
        """
        Update a Reference in storage with the target reference.
        This is used when the client has updated the reference in the UI.
        """
        for i, source in enumerate(self.references):
            if source.filename_md5 == target.filename_md5:
                logger.info(f"Updating reference {source.source_filename} ({source.filename_md5})")
                self.references[i] = target
                break
        else:
            logger.info(f"Unable to find reference {target.source_filename} ({target.filename_md5})")
            return
        self.save()
    
    def create_corpus(self):
        for ref in self.references:
            for chunk in ref.chunks:
                self.corpus.append(chunk.text)
                self.tokenized_corpus.append(chunk.text.lower().split())