import shutil
from collections import defaultdict
from uuid import uuid4

import requests
from sidecar import shared
from sidecar.projects import service as projects_service
from sidecar.references import storage
from sidecar.references.schemas import IngestStatus, Reference, ReferenceCreate
from sidecar.shared import chunk_reference


def fetch_pdf_to_uploads(
    url: str, project_id: str, user_id: str, metadata: ReferenceCreate
) -> ReferenceCreate:
    """
    Fetches a PDF from a URL and saves it to the project's uploads directory.

    Parameters
    ----------
    url : str
        The URL of the PDF to fetch.
    project_id : str
        The ID of the project to add the reference to.
    user_id : str
        The ID of the user who owns the project.
    metadata : dict
        The metadata to add to the reference.

    Returns
    -------
    ReferenceCreate
        The metadata of the reference to create.
    """
    response = requests.get(url)

    if not metadata.source_filename:
        metadata.source_filename = f"{metadata.title[:200]}.pdf"

    staged_filepath = projects_service.create_project_staging_filepath(
        user_id, project_id, metadata.source_filename
    )
    upload_filepath = projects_service.create_project_uploads_filepath(
        user_id, project_id, metadata.source_filename
    )

    # if `uploads` ingest has never been run, these directories might not exist yet
    staged_filepath.parent.mkdir(parents=True, exist_ok=True)
    upload_filepath.parent.mkdir(parents=True, exist_ok=True)

    with open(staged_filepath, "wb") as f:
        f.write(response.content)

    shutil.copyfile(staged_filepath, upload_filepath)
    staged_filepath.unlink()

    metadata.chunks = chunk_reference(metadata, filepath=upload_filepath)
    return metadata


def create_reference(
    project_id: str, metadata: ReferenceCreate, url: str = None
) -> Reference:
    """
    Creates a reference.

    Parameters
    ----------
    project_id : str
        The ID of the project to add the reference to.
    metadata : dict
        The metadata to add to the reference.
    url : str, optional
        The URL of the PDF to ingest.

    Returns
    -------
    Reference
        The created reference.
    """
    user_id = "user1"
    filepath = None
    store = storage.get_references_json_storage(user_id, project_id)

    if url:
        metadata = fetch_pdf_to_uploads(url, project_id, user_id, metadata)

        filepath = str(
            projects_service.create_project_uploads_filepath(
                user_id, project_id, metadata.source_filename
            )
        )

    ref = Reference(
        id=str(uuid4()),
        source_filename=metadata.source_filename,
        filepath=filepath,
        status=IngestStatus.COMPLETE,
        title=metadata.title,
        abstract=metadata.abstract,
        contents=metadata.contents,
        published_date=shared.parse_date(metadata.published_date),
        authors=metadata.authors,
        chunks=metadata.chunks,
        metadata=metadata.metadata,
    )
    add_citation_keys_for_references([ref], store.references)
    store.add_reference(ref)
    return store.get_reference(ref.id)


def add_citation_keys_for_references(
    new_references: list[Reference], existing_references: list[Reference] = []
) -> None:
    """
    Adds unique citation keys to a list of Reference objects.

    Parameters
    ----------
    new_references : list[Reference]
        The list of new Reference objects to add citation keys to.
    existing_references : list[Reference], optional
        The list of existing Reference objects to compare against.

    Returns
    -------
    list[Reference]
        The list of Reference objects with citation keys added.

    Notes
    -----
    Citation keys are based on Pandoc citation key formatting rules.

    A citation key is based on the Reference's first author surname
    and published date.

    If two References have the same author surname and published date,
    then the citation key is appended with a, b, c, etc.

    If a Reference does not have an author surname or published date,
    then the citation key becomes "untitled" and is appended with 1, 2, 3, etc.

    If a Reference already has a citation key, then it is not modified.

    https://quarto.org/docs/authoring/footnotes-and-citations.html#sec-citations
    """
    # we must determine the max current "appended" index for key
    # (e.g. 1, 2, 3, a, b, c, etc.)
    # this will determine the starting index for new references
    #
    # we do this by incrementing from what the citation key would have
    # been in its "unappended" format -- what the key would be if we did not
    # have any other references
    max_existing_index_by_key = {}
    for ref in existing_references:
        key = shared.create_citation_key(ref)
        if key not in max_existing_index_by_key:
            max_existing_index_by_key[key] = 1
        else:
            max_existing_index_by_key[key] += 1

    new_ref_key_groups = defaultdict(list)
    for ref in new_references:
        key = shared.create_citation_key(ref)
        new_ref_key_groups[key].append(ref)

    for key, new_refs_for_key in new_ref_key_groups.items():
        idx = max_existing_index_by_key.get(key, 0)

        # if no existing references ...
        if idx == 0:
            for i, ref in enumerate(new_refs_for_key):
                # first ref always gets the "unappended" key
                # this is necessary to maintain consistency upon new uploads
                if i == 0:
                    ref.citation_key = f"{key}"
                else:
                    if key == "untitled":
                        # untitled refs get numbered 1, 2, 3, etc.
                        ref.citation_key = f"{key}{i}"
                    else:
                        # others get numbered a, b, c, etc.
                        ref.citation_key = f"{key}{chr(97 + i)}"

        # if existing references, append as necessary starting
        # from existing max index for the key
        if idx > 0:
            for i, ref in enumerate(new_refs_for_key):
                if key == "untitled":
                    # untitleds start at 1
                    ref.citation_key = f"{key}{idx + i}"
                else:
                    # others start at a = chr(97)
                    # so need to subtract 1 since idx >= 1
                    ref.citation_key = f"{key}{chr(97 + idx - 1 + i)}"

    return new_references
