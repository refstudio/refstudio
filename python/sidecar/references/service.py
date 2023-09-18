import shutil
from uuid import uuid4

import requests
from sidecar.projects import service as projects_service
from sidecar.references import storage
from sidecar.references.schemas import IngestStatus, Reference, ReferenceCreate
from sidecar.shared import chunk_reference


def create_reference_from_url(
    project_id: str, url: str, metadata: ReferenceCreate
) -> Reference:
    """
    Creates a reference from a PDF URL.

    Parameters
    ----------
    project_id : str
        The ID of the project to add the reference to.
    url : str
        The URL of the PDF to ingest.
    metadata : dict
        The metadata to add to the reference.
    """
    user_id = "user1"

    if metadata.source_filename:
        filename = metadata.source_filename
    else:
        filename = f"{metadata.title}.pdf"

    source = requests.get(url)

    store = storage.get_references_json_storage(user_id, project_id)

    staged_filepath = projects_service.create_project_staging_filepath(
        user_id, project_id, filename
    )
    upload_filepath = projects_service.create_project_uploads_filepath(
        user_id, project_id, filename
    )

    # if `uploads` ingest has never been run, these directories might not exist yet
    staged_filepath.parent.mkdir(parents=True, exist_ok=True)
    upload_filepath.parent.mkdir(parents=True, exist_ok=True)

    with open(staged_filepath, "wb") as f:
        f.write(source.content)

    shutil.copyfile(staged_filepath, upload_filepath)

    ref = Reference(
        id=str(uuid4()),
        source_filename=filename,
        status=IngestStatus.COMPLETE,
        title=metadata.title,
        abstract=metadata.abstract,
        contents=metadata.contents,
        citation_key=metadata.citation_key,
        authors=metadata.authors,
        metadata=metadata.metadata,
    )
    ref.chunks = chunk_reference(ref, filepath=upload_filepath)
    store.add_reference(ref)

    staged_filepath.unlink()
    return store.get_reference(ref.id)
