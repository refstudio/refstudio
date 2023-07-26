import { JSONContent } from '@tiptap/core';

import { EditorIdFor } from './EditorData';

export interface RefStudioEditorContent {
  type: 'refstudio';
  jsonContent: JSONContent;
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
  | RefStudioEditorContent
  | PdfEditorContent
  | XmlEditorContent
  | JsonEditorContent
  | ReferencesEditorContent
  | ReferenceEditorContent;

export type EditorContentType = EditorContent['type'];
