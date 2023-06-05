export interface PdfIngestionResponse {
  project_name: string;
  references: RawReference[];
}

export interface RawReference {
  source_filename: string;
  filename_md5: string;
  title?: string;
  authors: RawAuthor[];
}

export interface RawAuthor {
  full_name: string;
  given_name: string;
  surname: string;
  email?: string;
}
