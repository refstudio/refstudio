import { makeUploadPath } from '../io/filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { universalGet } from './api';
import { DeleteStatusResponse } from './api-types';
import { callSidecar } from './sidecar';
import { apiPatch, apiPost } from './typed-api';
import { IngestResponse, Reference } from './types';

function parsePdfIngestionResponse(references: Reference[]): ReferenceItem[] {
  return references.map((reference) => ({
    id: reference.id,
    source_filename: reference.source_filename,
    filepath: makeUploadPath(reference.source_filename),
    filename: reference.source_filename,
    citationKey: reference.citation_key ?? 'unknown',
    title: reference.title ?? reference.source_filename.replace('.pdf', ''),
    publishedDate: reference.published_date ?? '',
    abstract: reference.abstract ?? '',
    status: reference.status,
    authors: (reference.authors ?? []).map((author) => ({
      fullName: author.full_name,
      lastName: author.surname ?? author.full_name.split(' ').pop() ?? '',
    })),
  }));
}

export async function runPDFIngestion(projectId: string): Promise<ReferenceItem[]> {
  // const ingestResponse = await universalPost<IngestResponse>(`/api/references/${projectId}`);
  const ingestResponse = (await apiPost('/api/references/{project_id}', {
    path: { project_id: projectId },
  })) as IngestResponse;
  return parsePdfIngestionResponse(ingestResponse.references);
}

export async function removeReferences(ids: string[], projectId: string) {
  const status = await universalPost<DeleteStatusResponse>(`/api/references/${projectId}/bulk_delete`, {
    reference_ids: ids,
  });
  if (status.status !== 'ok') {
    throw new Error(status.message);
  }
}

const UPDATABLE_FIELDS: (keyof ReferenceItem)[] = ['citationKey', 'title', 'publishedDate', 'authors'];
function applyPatch(field: keyof ReferenceItem, patch: Partial<ReferenceItem>, getPatch: () => Partial<Reference>) {
  if (UPDATABLE_FIELDS.includes(field) && Object.hasOwn(patch, field)) {
    return getPatch();
  }
  return {};
}

export async function updateReference(projectId: string, referenceId: string, patch: Partial<ReferenceItem>) {
  const referencePatch: Partial<Reference> = {
    ...applyPatch('citationKey', patch, () => ({ citation_key: patch.citationKey })),
    ...applyPatch('title', patch, () => ({ title: patch.title })),
    ...applyPatch('publishedDate', patch, () => ({ published_date: patch.publishedDate })),
    ...applyPatch('authors', patch, () => ({
      authors: patch.authors!.map((a) => ({ full_name: a.fullName, surname: a.lastName })),
    })),
  };

  if (Object.keys(referencePatch).length === 0) {
    return;
  }

  const status = await apiPatch(
    '/api/references/{project_id}/{reference_id}',
    { path: { project_id: projectId, reference_id: referenceId } },
    {
      data: referencePatch,
    },
  );
  if (status.status !== 'ok') {
    throw new Error(status.message);
  }
}

export async function getIngestedReferences(projectId: string): Promise<ReferenceItem[]> {
  const references = await universalGet<Reference[]>(`/api/references/${projectId}`);
  return parsePdfIngestionResponse(references);
}

export async function getIngestionStatus() {
  const response = await callSidecar('ingest_status', null);
  return {
    status: response.status,
    references: response.reference_statuses.map((refStatus) => ({
      filename: refStatus.source_filename,
      status: refStatus.status,
    })),
  };
}
