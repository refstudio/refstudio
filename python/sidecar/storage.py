import json
import sys

from sidecar import _typing, settings
from sidecar._typing import DeleteRequest, ReferenceUpdate
from sidecar.settings import logger

logger = logger.getChild(__name__)


def update_reference(reference_update: ReferenceUpdate):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    storage.update(reference_update=reference_update)


def delete_references(delete_request: DeleteRequest):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    storage.delete(source_filenames=delete_request.source_filenames, all_=delete_request.all)


class JsonStorage:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.references = []
        self.chunks = []
        self.corpus = []
        self.tokenized_corpus = []

    def load(self):
        with open(self.filepath, 'r') as f:
            data = json.load(f)

        for item in data:
            for k, v in item.items():
                if k == "authors":
                    authors = [_typing.Author(**a) for a in v]
                elif k == "chunks":
                    chunks = [_typing.Chunk(**c) for c in v]
            ref = _typing.Reference(**item)
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

    def delete(self, source_filenames: list[str] = [], all_: bool = False):
        """
        Delete one or more References from storage.

        Parameters
        ----------
        source_filenames : list[str]
            List of source filenames to be deleted
        all_ : bool, default False
            Delete all References from storage
        """
        if not source_filenames and not all_:
            msg = ("`delete` operation requires one of "
                   "`source_filenames` or `all_` input parameters")
            raise ValueError(msg)

        # preprocess references into a dict of source_filename: Reference
        # so that we can simply do `del refs[filename]`
        refs = {
            ref.source_filename: ref for ref in self.references
        }

        if all_:
            source_filenames = list(refs.keys())

        for filename in source_filenames:
            try:
                del refs[filename]
            except KeyError:
                msg = f"Unable to delete {filename}: not found in storage"
                logger.warning(msg)
                response = _typing.DeleteStatusResponse(
                    status=_typing.ResponseStatus.ERROR,
                    message=msg
                )
                sys.stdout.write(response.json())
                return

        self.references = list(refs.values())
        self.save()

        response = _typing.DeleteStatusResponse(
            status=_typing.ResponseStatus.OK,
            message=""
        )
        sys.stdout.write(response.json())

    def update(self, reference_update: _typing.ReferenceUpdate):
        """
        Update a Reference in storage with the target reference.
        This is used when the client has updated the reference in the UI.

        Parameters
        ----------
        reference_update : typing.ReferenceUpdate
        """
        refs = {
            ref.source_filename: ref for ref in self.references
        }

        source_filename = reference_update.source_filename
        patch = reference_update.patch

        try:
            target = refs[source_filename]
        except KeyError:
            msg = f"Unable to update {source_filename}: not found in storage"
            logger.error(msg)
            response = _typing.UpdateStatusResponse(
                status=_typing.ResponseStatus.ERROR,
                message=msg
            )
            sys.stdout.write(response.json())
            return

        logger.info(f"Updating {source_filename} with new values: {patch.data}")
        refs[source_filename] = target.copy(update=patch.data)

        self.references = list(refs.values())
        self.save()

        response = _typing.UpdateStatusResponse(
            status=_typing.ResponseStatus.OK,
            message=""
        )
        sys.stdout.write(response.json())

    def create_corpus(self):
        for ref in self.references:
            for chunk in ref.chunks:
                self.chunks.append(chunk)
                self.corpus.append(chunk.text)
                self.tokenized_corpus.append(chunk.text.lower().split())