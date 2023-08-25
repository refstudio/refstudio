import { IngestResponse, Reference } from './types';

export async function startRemoteReferencesIngestion(projectId: string) {
  const response = await fetch(`/api/references/${projectId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  });
  const references = (await response.json()) as IngestResponse;
  return references.references;
}

export async function getRemoteReferences(projectId: string) {
  const response = await fetch(`/api/references/${projectId}`);
  const references = (await response.json()) as Reference[];
  return references;
}

export async function deleteRemoteReference(projectId: string, referenceId: string) {
  await fetch(`/api/references/${projectId}/${referenceId}`, {
    method: 'DELETE',
  });
}

export async function deleteRemoteReferences(projectId: string, referenceIds: string[]) {
  await fetch(`/api/references/${projectId}/bulk_delete`, {
    method: 'DELETE',
    body: JSON.stringify({ reference_ids: referenceIds }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function patchRemoteReference(projectId: string, referenceId: string, patch: Partial<Reference>) {
  await fetch(`/api/references/${projectId}/${referenceId}`, {
    method: 'PATCH',
    body: JSON.stringify({ data: patch }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
