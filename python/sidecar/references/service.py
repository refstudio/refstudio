from uuid import uuid4

import requests
from sidecar import config
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
    from sidecar.api import api  # avoid circular import

    user_id = "user1"

    source = requests.get(url)
    filename = url.split("/")[-1]

    store = storage.get_references_json_storage(user_id, project_id)

    staged_filepath = projects_service.create_project_staging_filepath(
        user_id, project_id, filename
    )
    upload_filepath = projects_service.create_project_uploads_filepath(
        user_id, project_id, filename
    )

    urlpath = api.url_path_for(
        "create_file", project_id=project_id, filepath=f"uploads/{filename}"
    )
    upload_url = f"http://{config.HOST}:{config.PORT}{urlpath}"

    with open(staged_filepath, "wb") as f:
        f.write(source.content)

    with open(staged_filepath, "rb") as f:
        response = requests.put(
            upload_url, files={"file": (filename, f, "application/pdf")}
        )

    if response.status_code != 200:
        raise Exception(f"Error uploading file: {response.text}")

    ref = Reference(
        id=str(uuid4()),
        source_filename=metadata.source_filename,
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
