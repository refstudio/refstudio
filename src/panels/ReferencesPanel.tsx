import { FileUploader } from 'react-drag-drop-files';

import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { ensureProjectFileStructure, runPDFIngestion, uploadFiles } from '../filesystem';
import { ReferenceItem } from '../types/ReferenceItem';

const BASE_DIR = await ensureProjectFileStructure();

export function ReferencesPanel({ onRefClicked }: { onRefClicked?: (item: ReferenceItem) => void }) {
  async function handleChange(uploadedFiles: FileList) {
    try {
      await uploadFiles(uploadedFiles);
      console.log('File uploaded with success');

      await runPDFIngestion();
      console.log('PDFs ingested with success');
    } catch (err) {
      console.error('Error uploading references', err);
    }
  }

  return (
    <PanelWrapper title="References">
      <PanelSection grow title="Library">
        <ul className="space-y-2">
          {REFS_DATABASE.map((reference) => (
            <li
              className="mb-0 cursor-pointer p-1 hover:bg-slate-200"
              key={reference.id}
              onClick={() => onRefClicked?.(reference)}
            >
              <strong>{reference.id}</strong> - {reference.title}
              <br />
              <small>
                <em>
                  {reference.author}, {reference.year} by {reference.publisher}
                </em>
              </small>
            </li>
          ))}
        </ul>
        <p className="my-4 text-sm italic">Click on a reference to add it to the document.</p>
      </PanelSection>
      <PanelSection title="Upload">
        <FileUploader handleChange={handleChange} label="Upload or drop a file right here" multiple name="file" />
        <code className="mb-auto mt-10 block text-xs font-normal">{BASE_DIR}</code>
      </PanelSection>
    </PanelWrapper>
  );
}

const REFS_DATABASE: ReferenceItem[] = [
  {
    id: 'ref1',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    year: 2016,
    publisher: 'Pearson',
  },
  {
    id: 'ref2',
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    year: 2016,
    publisher: 'MIT Press',
  },
  {
    id: 'ref3',
    title: 'Machine Learning: A Probabilistic Perspective',
    author: 'Kevin P. Murphy',
    year: 2012,
    publisher: 'MIT Press',
  },
  {
    id: 'ref4',
    title: 'Pattern Recognition and Machine Learning',
    author: 'Christopher M. Bishop',
    year: 2006,
    publisher: 'Springer',
  },
  {
    id: 'ref5',
    title: 'Reinforcement Learning: An Introduction',
    author: 'Richard S. Sutton, Andrew G. Barto',
    year: 2018,
    publisher: 'MIT Press',
  },
];
