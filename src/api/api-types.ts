/** This file forwards generated API types as a convenience. */

import { components } from './raw-api-types';
type schemas = components['schemas'];

export type Author = schemas['Author'];
export type Body_create_file__project_id___filepath__put = schemas['Body_create_file__project_id___filepath__put'];
export type ChatRequest = schemas['ChatRequest'];
export type ChatResponse = schemas['ChatResponse'];
export type ChatResponseChoice = schemas['ChatResponseChoice'];
export type Chunk = schemas['Chunk'];
export type DeleteRequest = schemas['DeleteRequest'];
export type DeleteStatusResponse = schemas['DeleteStatusResponse'];
export type HTTPValidationError = schemas['HTTPValidationError'];
export type IngestStatus = schemas['IngestStatus'];
export type LoggingSettings = schemas['LoggingSettings'];
export type OpenAISettings = schemas['OpenAISettings'];
export type ProjectSettings = schemas['ProjectSettings'];
export type Reference = schemas['Reference'];
export type ReferencePatch = schemas['ReferencePatch'];
export type ResponseStatus = schemas['ResponseStatus'];
export type RewriteChoice = schemas['RewriteChoice'];
export type RewriteMannerType = schemas['RewriteMannerType'];
export type RewriteRequest = schemas['RewriteRequest'];
export type RewriteResponse = schemas['RewriteResponse'];
export type S2SearchResult = schemas['S2SearchResult'];
export type SearchRequest = schemas['SearchRequest'];
export type SearchResponse = schemas['SearchResponse'];
export type SettingsSchema = schemas['SettingsSchema'];
export type SidecarSettings = schemas['SidecarSettings'];
export type TextCompletionChoice = schemas['TextCompletionChoice'];
export type TextCompletionRequest = schemas['TextCompletionRequest'];
export type TextCompletionResponse = schemas['TextCompletionResponse'];
export type UpdateStatusResponse = schemas['UpdateStatusResponse'];
export type ValidationError = schemas['ValidationError'];
