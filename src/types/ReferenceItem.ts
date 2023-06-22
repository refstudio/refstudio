export interface ReferenceItem {
  id: string;
  filename: string;
  citationKey: string;
  publishedDate?: string;
  abstract?: string;
  title: string;
  authors: Author[];
}

interface Author {
  fullName: string;
}
