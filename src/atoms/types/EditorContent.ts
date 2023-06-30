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
}

export interface ReferenceEditorContent {
  type: 'reference';
  referenceId: string;
}

export type EditorContent =
  | TextEditorContent
  | PdfEditorContent
  | XmlEditorContent
  | JsonEditorContent
  | ReferencesEditorContent
  | ReferenceEditorContent;

export type EditorContentType = EditorContent['type'];
