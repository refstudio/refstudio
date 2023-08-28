import { makeUploadPath } from '../io/filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { universalDelete, universalGet, universalPatch, universalPost } from './api';
import { callSidecar } from './sidecar';
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
  const ingestResponse = await universalPost<IngestResponse>(`/api/references/${projectId}`);
  return parsePdfIngestionResponse(ingestResponse.references);
}

export async function removeReferences(ids: string[], projectId: string) {
  await universalDelete(`/api/references/${projectId}/bulk_delete`, { reference_ids: ids });
}

const UPDATABLE_FIELDS: (keyof ReferenceItem)[] = ['citationKey', 'title', 'publishedDate', 'authors'];
function applyPatch(field: keyof ReferenceItem, patch: Partial<ReferenceItem>, getPatch: () => Partial<Reference>) {
  if (UPDATABLE_FIELDS.includes(field) && Object.hasOwn(patch, field)) {
    return getPatch();
  }
  return {};
}

export async function updateReference(
  filename: string,
  patch: Partial<ReferenceItem>,
  referenceId: string,
  projectId: string,
) {
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

  await universalPatch(`/api/references/${projectId}/${referenceId}`, { data: patch });
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
