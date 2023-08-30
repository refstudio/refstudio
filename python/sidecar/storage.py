import json
from pathlib import Path

from sidecar import settings, typing
from sidecar.settings import logger
from sidecar.typing import DeleteRequest, ReferenceUpdate

logger = logger.getChild(__name__)


def get_reference(reference_id: str):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    return storage.get_reference(reference_id)


def update_reference(reference_id: str, reference_update: ReferenceUpdate):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    response = storage.update(reference_id, reference_update=reference_update)
    return response


def delete_references(delete_request: DeleteRequest):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    response = storage.delete(ids=delete_request.reference_ids, all_=delete_request.all)
    return response


class JsonStorage:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.references = []
        self.chunks = []
        self.corpus = []
        self.tokenized_corpus = []
        self.ensureStorageFileExists()

    def load(self):
        with open(self.filepath, "r") as f:
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

    def ensureStorageFileExists(self):
        if not Path(self.filepath).exists():
            logger.info(f"Creating {self.filepath}...")
            Path(self.filepath).parent.mkdir(parents=True, exist_ok=True)
            with open(self.filepath, "w") as f:
                json.dump([], f, indent=2)

    def save(self):
        """
        Save the references to the storage file as JSON.
        """
        contents = [ref.dict() for ref in self.references]
        with open(self.filepath, "w") as f:
            json.dump(contents, f, indent=2, default=str)

    def get_reference(self, reference_id: str) -> typing.Reference | None:
        """
        Get a Reference from storage by id.
        """
        for ref in self.references:
            if ref.id == reference_id:
                return ref
        return None

    def delete(self, reference_ids: list[str] = [], all_: bool = False):
        """
        Delete one or more References from storage.

        Parameters
        ----------
        reference_ids : list[str]
            List of reference ids to be deleted
        all_ : bool, default False
            Delete all References from storage
        """
        if not reference_ids and not all_:
            msg = (
                "`delete` operation requires one of " "`ids` or `all_` input parameters"
            )
            raise ValueError(msg)

        # preprocess references into a dict of reference_ids: Reference
        # so that we can simply do `del refs[ref_id]]`
        refs = {ref.id: ref for ref in self.references}

        if all_:
            reference_ids = list(refs.keys())

        for ref_id in reference_ids:
            try:
                del refs[ref_id]
            except KeyError:
                msg = f"Unable to delete {ref_id}: not found in storage"
                logger.warning(msg)
                response = typing.DeleteStatusResponse(
                    status=typing.ResponseStatus.ERROR, message=msg
                )
                return response

        self.references = list(refs.values())
        self.save()

        response = typing.DeleteStatusResponse(
            status=typing.ResponseStatus.OK, message=""
        )
        return response

    def update(self, reference_id: str, patch: typing.ReferencePatch):
        """
        Update a Reference in storage with the target reference.
        This is used when the client has updated the reference in the UI.

        Parameters
        ----------
        reference_id : str
            The id of the reference to be updated
        patch : ReferencePatch
            The patch object containing the updated reference data
        """
        refs = {ref.id: ref for ref in self.references}

        try:
            target = refs[reference_id]
        except KeyError:
            msg = f"Unable to update {reference_id}: not found in storage"
            logger.error(msg)
            response = typing.UpdateStatusResponse(
                status=typing.ResponseStatus.ERROR, message=msg
            )
            return response

        logger.info(f"Updating {reference_id} with new values: {patch.data}")
        refs[reference_id] = target.copy(update=patch.data)

        self.references = list(refs.values())
        self.save()

        response = typing.UpdateStatusResponse(
            status=typing.ResponseStatus.OK, message=""
        )
        return response

    def create_corpus(self):
        for ref in self.references:
            for chunk in ref.chunks:
                self.chunks.append(chunk)
                self.corpus.append(chunk.text)
                self.tokenized_corpus.append(chunk.text.lower().split())
