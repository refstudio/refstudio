import { Command } from '@tauri-apps/api/shell';

import { getUploadsDir } from '../filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { RawPdfIngestionResponse } from './types';

function parsePdfIngestionResponse(response: RawPdfIngestionResponse): ReferenceItem[] {
  return response.references.map((reference) => ({
    id: reference.filename_md5,
    title: reference.title ?? reference.source_filename.replace('.pdf', ''),
    authors: reference.authors.map((author) => ({ fullName: author.full_name, surname: author.surname })),
  }));
}

export async function runPDFIngestion(): Promise<ReferenceItem[]> {
  const uploadsDir = await getUploadsDir();
  const command = new Command('call-sidecar', ['ingest', '--pdf_directory', `${uploadsDir.toString()}`]);
  console.log('command', command);
  const output = await command.execute();
  const response = JSON.parse(output.stdout) as RawPdfIngestionResponse;
  console.log('response', response);
  return parsePdfIngestionResponse(response);
}
