from __future__ import annotations

import json
from pathlib import Path

from sidecar.config import logger
from sidecar.projects.service import get_project_path
from sidecar.references.schemas import (
    Author,
    Chunk,
    DeleteStatusResponse,
    Reference,
    ReferencePatch,
    UpdateStatusResponse,
)
from sidecar.typing import ResponseStatus

logger = logger.getChild(__name__)


def get_references_json_path(user_id: str, project_id: str) -> Path:
    """
    Returns the path to the JSON file that stores the references for a given
    project.
    """
    project_path = get_project_path(user_id=user_id, project_id=project_id)
    return project_path / ".storage" / "references.json"


def get_references_json_storage(user_id: str, project_id: str) -> JsonStorage:
    """
    Returns the JSON storage object for a given project.
    """
    filepath = get_references_json_path(user_id=user_id, project_id=project_id)
    storage = JsonStorage(filepath=filepath)
    storage.load()
    return storage


class JsonStorage:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.references = []
        self.chunks = []
        self.corpus = []
        self.tokenized_corpus = []

    def load(self):
        with open(self.filepath, "r") as f:
            data = json.load(f)

        for item in data:
            for k, v in item.items():
                if k == "authors":
                    authors = [Author(**a) for a in v]
                elif k == "chunks":
                    chunks = [Chunk(**c) for c in v]
            ref = Reference(**item)
            ref.authors = authors
            ref.chunks = chunks
            self.references.append(ref)
        self.create_corpus()

    def save(self):
        """
        Save the references to the storage file as JSON.
        """
        contents = [ref.dict() for ref in self.references]
        with open(self.filepath, "w") as f:
            json.dump(contents, f, indent=2, default=str)

    def add_reference(self, reference: Reference) -> None:
        """
        Add a Reference to storage.
        """
        self.references.append(reference)
        self.save()

    def get_reference(self, reference_id: str) -> Reference | None:
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
                response = DeleteStatusResponse(
                    status=ResponseStatus.ERROR, message=msg
                )
                return response

        self.references = list(refs.values())
        self.save()

        response = DeleteStatusResponse(status=ResponseStatus.OK, message="")
        return response

    def update(self, reference_id: str, patch: ReferencePatch):
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
            response = UpdateStatusResponse(status=ResponseStatus.ERROR, message=msg)
            return response

        logger.info(f"Updating {reference_id} with new values: {patch.data}")
        refs[reference_id] = target.copy(update=patch.data)

        self.references = list(refs.values())
        self.save()

        response = UpdateStatusResponse(status=ResponseStatus.OK, message="")
        return response

    def create_corpus(self):
        for ref in self.references:
            for chunk in ref.chunks:
                self.chunks.append(chunk)
                self.corpus.append(chunk.text)
                self.tokenized_corpus.append(chunk.text.lower().split())
