import { ReferenceItem } from '../../types/ReferenceItem';

export const REFERENCES: ReferenceItem[] = [
  {
    id: 'A Few Useful Things to Know about Machine Learning.pdf',
    filepath: '/path/to/A Few Useful Things to Know about Machine Learning.pdf',
    filename: 'A Few Useful Things to Know about Machine Learning.pdf',
    title: 'A Few Useful Things to Know about Machine Learning.pdf',
    citationKey: 'citationKey',
    status: 'complete',
    authors: [{ fullName: 'Joe Doe', lastName: 'Doe' }],
  },
  {
    id: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
    filepath: '/path/to/Rules of Machine Learning - Best Practices for ML Engineering.pdf',
    filename: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
    title: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
    citationKey: 'citationKey 2',
    status: 'complete',
    authors: [
      { fullName: 'Joe Doe', lastName: 'Doe' },
      { fullName: 'Ana Maria', lastName: 'Maria' },
    ],
  },
];
