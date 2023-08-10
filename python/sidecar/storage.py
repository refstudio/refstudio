import json
import sys

from sidecar import settings, typing
from sidecar.settings import logger
from sidecar.typing import DeleteRequest, ReferenceUpdate, LinkRequest
import semanticscholar

logger = logger.getChild(__name__)


def update_reference(reference_update: ReferenceUpdate):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    storage.update(reference_update=reference_update)


def delete_references(delete_request: DeleteRequest):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    storage.delete(source_filenames=delete_request.source_filenames, all_=delete_request.all)

def link_references(reference_update: LinkRequest):
    storage = JsonStorage(settings.REFERENCES_JSON_PATH)
    storage.load()
    if reference_update.doi:
        storage.link_s2_doi()


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

    def link_s2_doi(self):
        """
        Link the references to S2 paperId using DOI.
        """
        success_count = 0
        total_count = len(self.references)
        s2_object = semanticscholar.SemanticScholar()
        for reference in self.references:
            if reference.doi:
                try:
                    paper = s2_object.get_paper(reference.doi, fields=["title", "paperId"])
                    logger.info(
                        f" Linking DOI: {reference.doi} --> {paper.title} and {paper.paperId}"
                    )
                    reference.s2_paperId = paper.paperId
                    success_count+=1
                except (
                    semanticscholar.SemanticScholarException.ObjectNotFoundExeception
                ) as e:
                    logger.info(f"Paper with doi {reference.doi} not found.")

                except Exception as e:
                    logger.info(f"Linking: An unexpected error occurred: {e}")
        self.save()
        response = typing.LinkResponse(
            status=typing.ResponseStatus.OK,
            message="Linking with s2 complete for {} out of {} references".format(success_count, total_count),
        )
        sys.stdout.write(response.json())

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

    def update(self, reference_update: typing.ReferenceUpdate):
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
            response = typing.UpdateStatusResponse(
                status=typing.ResponseStatus.ERROR,
                message=msg
            )
            sys.stdout.write(response.json())
            return

        logger.info(f"Updating {source_filename} with new values: {patch.data}")
        refs[source_filename] = target.copy(update=patch.data)

        self.references = list(refs.values())
        self.save()

        response = typing.UpdateStatusResponse(
            status=typing.ResponseStatus.OK,
            message=""
        )
        sys.stdout.write(response.json())

    def create_corpus(self):
        for ref in self.references:
            for chunk in ref.chunks:
                self.chunks.append(chunk)
                self.corpus.append(chunk.text)
                self.tokenized_corpus.append(chunk.text.lower().split())