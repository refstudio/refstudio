import { JSONContent } from '@tiptap/react';

export interface TipTapFileContent {
  type: 'tiptap';
  content: string | JSONContent;
}

export interface PdfFileContent {
  type: 'pdf';
  binaryContent: Uint8Array;
}

export interface XmlFileContent {
  type: 'xml';
  textContent: string;
}

export interface JsonFileContent {
  type: 'json';
  textContent: string;
}

export interface ReferenceFileContent {
  type: 'reference';
  referenceId: string;
}

export type FileContent = TipTapFileContent | PdfFileContent | XmlFileContent | JsonFileContent | ReferenceFileContent;
