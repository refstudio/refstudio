export interface ReferenceItem {
  id: string;
  filepath: string;
  filename: string;
  citationKey: string;
  publishedDate?: string;
  abstract?: string;
  title: string;
  status: ReferenceItemStatus;
  authors: Author[];
  doi: string;
  metadata?: ReferenceMetadata;
}

export interface Author {
  fullName: string;
  lastName: string;
}

export interface ReferenceMetadata {
  sourceId?: string;
  source?: string;
}

export type ReferenceItemStatus = 'processing' | 'failure' | 'complete';
