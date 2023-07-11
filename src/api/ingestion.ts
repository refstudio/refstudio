import { getSystemPath, getUploadsDir, makeUploadPath } from '../io/filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { callSidecar } from './sidecar';
import { IngestResponse, Reference } from './types';

function parsePdfIngestionResponse(response: IngestResponse): ReferenceItem[] {
  return response.references.map((reference) => ({
    id: reference.source_filename,
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

export async function runPDFIngestion(): Promise<ReferenceItem[]> {
  const uploadsDir = await getSystemPath(getUploadsDir());
  const response = await callSidecar('ingest', { pdf_directory: String(uploadsDir) });
  return parsePdfIngestionResponse(response);
}

export async function removeReferences(fileNames: string[]) {
  const response = await callSidecar('delete', { source_filenames: fileNames });
  if (response.status === 'error') {
    throw new Error('Error removing references: ' + response.message);
  }
}

export async function updateReference(filename: string, patch: Partial<ReferenceItem>) {
  const referencePatch: Partial<Reference> = {
    ...(patch.citationKey ? { citation_key: patch.citationKey } : {}),
    ...(patch.title ? { title: patch.title } : {}),
    ...(patch.publishedDate ? { published_date: patch.publishedDate } : {}),
    ...(patch.authors ? { authors: patch.authors.map((a) => ({ full_name: a.fullName, surname: a.lastName })) } : {}),
  };
  const response = await callSidecar('update', {
    source_filename: filename,
    patch: {
      data: referencePatch,
    },
  });
  if (response.status === 'error') {
    throw new Error('Error updating reference: ' + response.message);
  }
}

export async function getIngestedReferences(): Promise<ReferenceItem[]> {
  const uploadsDir = await getSystemPath(getUploadsDir());
  const response = await callSidecar('ingest_references', { pdf_directory: String(uploadsDir) });
  return parsePdfIngestionResponse(response);
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
