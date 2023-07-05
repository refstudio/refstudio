import { UPLOADS_DIR } from '../../../io/filesystem';
import { ReferenceItem } from '../../../types/ReferenceItem';

export const REFERENCES: ReferenceItem[] = [
  {
    id: 'a_few_useful_things_to_know_about_machine_learning',
    filepath: `/${UPLOADS_DIR}/A Few Useful Things to Know about Machine Learning.pdf`,
    filename: 'A Few Useful Things to Know about Machine Learning.pdf',
    title: 'REF1 A Few Useful Things to Know about Machine Learning',
    citationKey: 'doe2023',
    status: 'complete',
    authors: [{ fullName: 'Joe Doe', lastName: 'Doe' }],
  },
  {
    id: 'rules_of_machine_learning_-_best_practices_for_ml_engineering',
    filepath: `/${UPLOADS_DIR}/Rules of Machine Learning - Best Practices for ML Engineering.pdf`,
    filename: 'Rules of Machine Learning - Best Practices for ML Engineering.pdf',
    title: 'REF2 Rules of Machine Learning - Best Practices for ML Engineering',
    citationKey: 'maria',
    status: 'complete',
    authors: [
      { fullName: 'Joe Doe', lastName: 'Doe' },
      { fullName: 'Ana Maria', lastName: 'Maria' },
    ],
  },
];
