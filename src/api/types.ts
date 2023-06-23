/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * An enumeration.
 */
export type IngestStatus = 'processing' | 'failure' | 'complete';
/**
 * An enumeration.
 */
export type ResponseStatus = 'ok' | 'error';

export interface CliCommands {
  ingest: IngestResponse;
  ingest_status: IngestStatusResponse;
  rewrite: RewriteChoice[];
  chat: ChatResponseChoice[];
  delete: ResponseStatus;
}
export interface IngestResponse {
  project_name: string;
  references: Reference[];
}
/**
 * A reference for an academic paper / PDF
 */
export interface Reference {
  source_filename: string;
  filename_md5: string;
  status: IngestStatus;
  citation_key?: string;
  title?: string;
  abstract?: string;
  contents?: string;
  published_date?: string;
  authors?: Author[];
  chunks?: Chunk[];
  metadata?: {};
}
export interface Author {
  full_name: string;
  given_name?: string;
  surname?: string;
  email?: string;
}
export interface Chunk {
  text: string;
  vector?: number[];
  metadata?: {};
}
export interface IngestStatusResponse {
  status: ResponseStatus;
  reference_statuses: ReferenceStatus[];
}
export interface ReferenceStatus {
  source_filename: string;
  status: IngestStatus;
}
export interface RewriteChoice {
  index: number;
  text: string;
}
export interface ChatResponseChoice {
  index: number;
  text: string;
}
