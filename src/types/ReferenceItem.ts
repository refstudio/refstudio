export interface ReferenceItem {
  id: string;
  title: string;
  authors: Author[];
}

interface Author {
  fullName: string;
  surname?: string;
}
