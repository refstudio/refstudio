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
}

export interface Author {
  fullName: string;
  lastName: string;
}

export type ReferenceItemStatus = 'processing' | 'failure' | 'complete';
