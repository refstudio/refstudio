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
/**
 * An enumeration.
 */
export type RewriteMannerType = 'concise' | 'elaborate' | 'scholarly';

export interface CliCommands {
  /**
   * @minItems 2
   * @maxItems 2
   */
  ingest: [IngestRequest, IngestResponse];
  /**
   * @minItems 2
   * @maxItems 2
   */
  ingest_status: [null, IngestStatusResponse];
  /**
   * @minItems 2
   * @maxItems 2
   */
  ingest_references: [IngestRequest, IngestResponse];
  /**
   * @minItems 2
   * @maxItems 2
   */
  rewrite: [RewriteRequest, RewriteResponse];
  /**
   * @minItems 2
   * @maxItems 2
   */
  completion: [TextCompletionRequest, TextCompletionResponse];
  /**
   * @minItems 2
   * @maxItems 2
   */
  chat: [ChatRequest, ChatResponse];
  /**
   * @minItems 2
   * @maxItems 2
   */
  update: [ReferenceUpdate, UpdateStatusResponse];
  /**
   * @minItems 2
   * @maxItems 2
   */
  delete: [DeleteRequest, DeleteStatusResponse];
}
export interface IngestRequest {
  pdf_directory: string;
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
export interface RewriteRequest {
  text: string;
  manner?: RewriteMannerType & string;
  n_choices?: number;
  temperature?: number;
}
export interface RewriteResponse {
  status: ResponseStatus;
  message: string;
  choices: RewriteChoice[];
}
export interface RewriteChoice {
  index: number;
  text: string;
}
export interface TextCompletionRequest {
  text: string;
  n_choices?: number;
  temperature?: number;
  max_tokens?: number;
  title?: string;
  abstract?: string;
}
export interface TextCompletionResponse {
  status: ResponseStatus;
  message: string;
  choices: TextCompletionChoice[];
}
export interface TextCompletionChoice {
  index: number;
  text: string;
}
export interface ChatRequest {
  text: string;
  n_choices?: number;
  temperature?: number;
}
export interface ChatResponse {
  status: ResponseStatus;
  message: string;
  choices: ChatResponseChoice[];
}
export interface ChatResponseChoice {
  index: number;
  text: string;
}
export interface ReferenceUpdate {
  source_filename: string;
  patch: ReferencePatch;
}
/**
 * ReferencePatch is the input type for updating a Reference's metadata.
 */
export interface ReferencePatch {
  data: {};
}
export interface UpdateStatusResponse {
  status: ResponseStatus;
  message: string;
}
export interface DeleteRequest {
  source_filenames: string[];
  all?: boolean;
}
export interface DeleteStatusResponse {
  status: ResponseStatus;
  message: string;
}
