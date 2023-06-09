import { EditorIdFor } from './EditorData';

export interface TextEditorContent {
  type: 'text';
  textContent: string;
}

export interface PdfEditorContent {
  type: 'pdf';
  binaryContent: Uint8Array;
}

export interface XmlEditorContent {
  type: 'xml';
  textContent: string;
}

export interface JsonEditorContent {
  type: 'json';
  textContent: string;
}

export interface ReferencesEditorContent {
  type: 'references';
  filter?: string;
}

export interface ReferenceEditorContent {
  type: 'reference';
  referenceId: EditorIdFor<'reference'>;
}

export type EditorContent =
  | TextEditorContent
  | PdfEditorContent
  | XmlEditorContent
  | JsonEditorContent
  | ReferencesEditorContent
  | ReferenceEditorContent;

export type EditorContentType = EditorContent['type'];
