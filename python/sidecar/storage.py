import json
import logging
import os
import sys

from sidecar import settings, typing

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


def delete_references(source_filenames: list[str]):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    storage.delete(source_filenames)


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
    
    def delete(self, source_filenames: list[str]):
        """
        Delete a Reference from storage.
        """
        # preprocess references into a dict of source_filename: Reference
        # so that we can simply do `del refs[filename]`
        refs = {
            ref.source_filename: ref for ref in self.references
        }

        for filename in source_filenames:
            try:
                del refs[filename]
            except KeyError:
                msg = f"Unable to delete {filename}: not found in storage"
                logger.warning(msg)
                response = typing.DeleteStatusResponse(
                    status=typing.ResponseStatus.ERROR,
                    message=msg
                )
                sys.stdout.write(response.json())
                return
        
        self.references = list(refs.values())
        self.save()
        
        response = typing.DeleteStatusResponse(
            status=typing.ResponseStatus.OK,
            message=""
        )
        sys.stdout.write(response.json())
    
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