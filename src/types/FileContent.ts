export interface TipTapFileContent {
  type: 'TIPTAP';
  textContent: string;
}

export interface PdfFileContent {
  type: 'PDF';
  binaryContent: Uint8Array;
}

export interface XmlFileContent {
  type: 'XML';
  textContent: string;
}

export interface JsonFileContent {
  type: 'JSON';
  textContent: string;
}

export type FileContent = TipTapFileContent | PdfFileContent | XmlFileContent | JsonFileContent;
