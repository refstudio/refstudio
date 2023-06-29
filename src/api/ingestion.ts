import { getUploadsDir } from '../io/filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { callSidecar } from './sidecar';
import { IngestResponse } from './types';

function parsePdfIngestionResponse(response: IngestResponse, uploadsDir: string): ReferenceItem[] {
  return response.references.map((reference) => ({
    id: reference.filename_md5,
    filepath: `${uploadsDir}/${reference.source_filename}`,
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
  const uploadsDir = await getUploadsDir();
  const response = await callSidecar('ingest', ['--pdf_directory', String(uploadsDir)]);
  return parsePdfIngestionResponse(response, uploadsDir);
}
