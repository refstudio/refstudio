import { getUploadsDir } from '../filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { callSidecar } from './sidecar';
import { IngestResponse } from './types';

function parsePdfIngestionResponse(response: IngestResponse): ReferenceItem[] {
  return response.references.map((reference) => ({
    id: reference.filename_md5,
    title: reference.title ?? reference.source_filename.replace('.pdf', ''),
    authors: (reference.authors ?? []).map((author) => ({ fullName: author.full_name })),
  }));
}

export async function runPDFIngestion(): Promise<ReferenceItem[]> {
  const uploadsDir = await getUploadsDir();
  const response = await callSidecar('ingest', ['--pdf_directory', String(uploadsDir)]);
  return parsePdfIngestionResponse(response);
}
