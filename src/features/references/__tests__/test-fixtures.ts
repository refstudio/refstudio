import { ReferenceItem } from '../../../types/ReferenceItem';

export const REFERENCES: ReferenceItem[] = [
  {
    id: '9ddf658f-66d0-48e2-b0f2-e2ab168d6cab',
    filepath: '/any/path/A Few Useful Things to Know about Machine Learning.pdf',
    filename: 'A Few Useful Things to Know about Machine Learning.pdf',
    title: 'REF1 A Few Useful Things to Know about Machine Learning',
    citationKey: 'doe2023',
    status: 'complete',
    doi: '0000',
    authors: [{ fullName: 'Joe Doe', lastName: 'Doe' }],
    publishedDate: '2023-08-15',
    metadata: {
      sourceId: '1234',
      source: 's2',
    },
  },
  {
    id: '45722618-c4fb-4ae1-9230-7fc19a7219ed',
    filepath: '/any/path/Rules of Machine Learning - Best Practices for ML Engineering.pdf',
    filename: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
    title: 'REF2 Rules of Machine Learning - Best Practices for ML Engineering',
    citationKey: 'maria',
    status: 'complete',
    doi: '0000',
    authors: [
      { fullName: 'Joe Doe', lastName: 'Doe' },
      { fullName: 'Ana Maria', lastName: 'Maria' },
    ],
  },
];
