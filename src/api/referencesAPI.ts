import { makeUploadPath } from '../io/filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { Reference } from './api-types';
import { apiGetJson, apiPatch, apiPost } from './typed-api';

export async function runProjectIngestion(projectId: string): Promise<ReferenceItem[]> {
  const ingestResponse = await apiPost('/api/references/{project_id}', { path: { project_id: projectId } }, {});
  return parsePdfIngestionResponse(ingestResponse.references);
}

export async function removeProjectReferences(projectId: string, ids: string[]) {
  const status = await apiPost(
    '/api/references/{project_id}/bulk_delete',
    { path: { project_id: projectId } },
    {
      reference_ids: ids,
    },
  );
  if (status.status !== 'ok') {
    throw new Error(status.message);
  }
}

export async function updateProjectReference(projectId: string, referenceId: string, patch: Partial<ReferenceItem>) {
  const referencePatch: Partial<Reference> = {
    ...applyPatch('citationKey', patch, () => ({ citation_key: patch.citationKey })),
    ...applyPatch('title', patch, () => ({ title: patch.title })),
    ...applyPatch('publishedDate', patch, () => ({ published_date: patch.publishedDate })),
    ...applyPatch('doi', patch, () => ({ doi: patch.doi })),
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

export async function getProjectReferences(projectId: string): Promise<ReferenceItem[]> {
  const references = await apiGetJson('/api/references/{project_id}', { path: { project_id: projectId } });
  return parsePdfIngestionResponse(references);
}

// #####################################################################################
// Utility functions
// #####################################################################################
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
    doi: reference.doi ?? '',
    authors: (reference.authors ?? []).map((author) => ({
      fullName: author.full_name,
      lastName: author.surname ?? author.full_name.split(' ').pop() ?? '',
    })),
  }));
}

const UPDATABLE_FIELDS: (keyof ReferenceItem)[] = ['citationKey', 'title', 'publishedDate', 'authors', 'doi'];
function applyPatch(field: keyof ReferenceItem, patch: Partial<ReferenceItem>, getPatch: () => Partial<Reference>) {
  if (UPDATABLE_FIELDS.includes(field) && Object.hasOwn(patch, field)) {
    return getPatch();
  }
  return {};
}
