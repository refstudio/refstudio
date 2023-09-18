import shutil
from uuid import uuid4

import requests
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
        metadata.source_filename = f"{metadata.title}.pdf"

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
    store = storage.get_references_json_storage(user_id, project_id)

    if url:
        metadata = fetch_pdf_to_uploads(url, project_id, user_id, metadata)

    ref = Reference(
        id=str(uuid4()),
        source_filename=metadata.source_filename,
        status=IngestStatus.COMPLETE,
        title=metadata.title,
        abstract=metadata.abstract,
        contents=metadata.contents,
        citation_key=metadata.citation_key,
        authors=metadata.authors,
        chunks=metadata.chunks,
        metadata=metadata.metadata,
    )
    store.add_reference(ref)
    return store.get_reference(ref.id)
