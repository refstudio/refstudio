/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * An enumeration.
 *
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "ResponseStatus".
 */
export type ResponseStatus = 'ok' | 'error';
export type Location = (string | number)[];
export type Message = string;
export type ErrorType = string;
export type Detail = ValidationError[];
/**
 * An enumeration.
 *
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "IngestStatus".
 */
export type IngestStatus = 'processing' | 'failure' | 'complete';
/**
 * An enumeration.
 *
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "RewriteMannerType".
 */
export type RewriteMannerType = 'concise' | 'elaborate' | 'scholarly';
export type File = string;

export interface ApiSchema {
  [k: string]: unknown;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "Author".
 */
export interface Author {
  full_name: string;
  given_name?: string;
  surname?: string;
  email?: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "Chunk".
 */
export interface Chunk {
  text: string;
  vector?: number[];
  metadata?: {};
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "DeleteRequest".
 */
export interface DeleteRequest {
  reference_ids: string[];
  all?: boolean;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "DeleteStatusResponse".
 */
export interface DeleteStatusResponse {
  status: ResponseStatus;
  message: string;
}
/**
 * Use this to indicate that a request only accepts an empty object ({})
 *
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "EmptyRequest".
 */
export interface EmptyRequest {}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "HTTPValidationError".
 */
export interface HTTPValidationError {
  detail?: Detail;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "ValidationError".
 */
export interface ValidationError {
  loc: Location;
  msg: Message;
  type: ErrorType;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "IngestResponse".
 */
export interface IngestResponse {
  project_name: string;
  references: Reference[];
}
/**
 * A reference for an academic paper / PDF
 *
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "Reference".
 */
export interface Reference {
  id: string;
  source_filename: string;
  status: IngestStatus;
  citation_key?: string;
  doi?: string;
  title?: string;
  abstract?: string;
  contents?: string;
  published_date?: string;
  authors?: Author[];
  chunks?: Chunk[];
  metadata?: {};
}
/**
 * ReferencePatch is the input type for updating a Reference's metadata.
 *
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "ReferencePatch".
 */
export interface ReferencePatch {
  data: {};
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "UpdateStatusResponse".
 */
export interface UpdateStatusResponse {
  status: ResponseStatus;
  message: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "ChatRequest".
 */
export interface ChatRequest {
  text: string;
  n_choices?: number;
  temperature?: number;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "ChatResponse".
 */
export interface ChatResponse {
  status: ResponseStatus;
  message: string;
  choices: ChatResponseChoice[];
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "ChatResponseChoice".
 */
export interface ChatResponseChoice {
  index: number;
  text: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "RewriteChoice".
 */
export interface RewriteChoice {
  index: number;
  text: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "RewriteRequest".
 */
export interface RewriteRequest {
  text: string;
  manner?: RewriteMannerType & string;
  n_choices?: number;
  temperature?: number;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "RewriteResponse".
 */
export interface RewriteResponse {
  status: ResponseStatus;
  message: string;
  choices: RewriteChoice[];
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "TextCompletionChoice".
 */
export interface TextCompletionChoice {
  index: number;
  text: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "TextCompletionRequest".
 */
export interface TextCompletionRequest {
  text: string;
  n_choices?: number;
  temperature?: number;
  max_tokens?: number;
  title?: string;
  abstract?: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "TextCompletionResponse".
 */
export interface TextCompletionResponse {
  status: ResponseStatus;
  message: string;
  choices: TextCompletionChoice[];
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "S2SearchResult".
 */
export interface S2SearchResult {
  title?: string;
  abstract?: string;
  venue?: string;
  year?: number;
  paperId?: string;
  citationCount?: number;
  openAccessPdf?: string;
  authors?: string[];
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "SearchRequest".
 */
export interface SearchRequest {
  query: string;
  limit?: number;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "SearchResponse".
 */
export interface SearchResponse {
  status: ResponseStatus;
  message: string;
  results: S2SearchResult[];
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "Body_create_file__project_id___filepath__put".
 */
export interface BodyCreateFile_ProjectId__Filepath_Put {
  file: File;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "LoggingSettings".
 */
export interface LoggingSettings {
  enable?: boolean;
  filepath?: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "OpenAISettings".
 */
export interface OpenAISettings {
  api_key?: string;
  chat_model?: string;
  manner?: RewriteMannerType & string;
  temperature?: number;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "ProjectSettings".
 */
export interface ProjectSettings {
  current_directory?: string;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "SettingsSchema".
 */
export interface SettingsSchema {
  project?: ProjectSettings;
  openai?: OpenAISettings;
  sidecar?: SidecarSettings;
}
/**
 * This interface was referenced by `ApiSchema`'s JSON-Schema
 * via the `definition` "SidecarSettings".
 */
export interface SidecarSettings {
  logging?: LoggingSettings;
}
