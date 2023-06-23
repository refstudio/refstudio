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


def update_reference(data):
    pass


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
            json.dump(contents, f, indent=2, default=str)
    
    def update(self, updates: list[typing.ReferenceUpdate]):
        """
        Update a Reference in storage with the target reference.
        This is used when the client has updated the reference in the UI.
        """
        refs = {
            ref.source_filename: ref.json() for ref in self.references
        }

        for update in updates:
            try:
                target = refs[update.source_filename]
            except KeyError as e:
                logger.error(f"Reference {update.source_filename} not found in json storage: {e}")
                continue

            for field, val in update.updates.items():
                logger.info(f"Updating {field} to {val} for Reference {update.source_filename}")
                target[field] = val
        self.save()
    
    def create_corpus(self):
        for ref in self.references:
            for chunk in ref.chunks:
                self.corpus.append(chunk.text)
                self.tokenized_corpus.append(chunk.text.lower().split())