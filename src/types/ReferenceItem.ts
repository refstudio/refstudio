export interface ReferenceItem {
  id: string;
  citationKey: string;
  title: string;
  authors: Author[];
}

interface Author {
  fullName: string;
}
