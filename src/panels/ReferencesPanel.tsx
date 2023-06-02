
import { useAtomValue, useSetAtom } from 'jotai';
import { FileUploader } from 'react-drag-drop-files';

import { addPdfIngestionProcessAtom, getReferencesAtom, isPdfIngestionRunningAtom, removePdfIngestionProcessAtom, setReferencesAtom } from '../atoms/referencesState';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { Spinner } from '../components/Spinner';
import { ensureProjectFileStructure, runPDFIngestion, uploadFiles } from '../filesystem';
import { ReferenceItem } from '../types/ReferenceItem';

const BASE_DIR = await ensureProjectFileStructure();

interface ReferencesPanelProps {
  onRefClicked: (item: ReferenceItem) => void;
}

export function ReferencesPanel({ onRefClicked }: ReferencesPanelProps) {
  const references = useAtomValue(getReferencesAtom);
  const setReferences = useSetAtom(setReferencesAtom);
  const isPdfIngestionLoading = useAtomValue(isPdfIngestionRunningAtom);
  const addPdfIngestionProcess = useSetAtom(addPdfIngestionProcessAtom);
  const removePdfIngestionProcess = useSetAtom(removePdfIngestionProcessAtom);

  async function handleChange(uploadedFiles: FileList) {
    // Using the current timestamp as the processId
    const processId = Date.now().toString();
    try {
      addPdfIngestionProcess(processId);

      await uploadFiles(uploadedFiles);
      console.log('File uploaded with success');

      const updatedReferences = await runPDFIngestion();
      setReferences(updatedReferences);
      console.log('PDFs ingested with success');

    } catch (err) {
      console.error('Error uploading references', err);
    } finally {
      removePdfIngestionProcess(processId);
    }
  }

  return (
    <PanelWrapper title="References">
      <PanelSection grow title="Library">
        <ul className="space-y-2">
          {references.map((reference) => (
            <li
              className="mb-0 cursor-pointer p-1 hover:bg-slate-200 overflow-x-hidden text-ellipsis"
              key={reference.id}
              onClick={() => onRefClicked(reference)}
            >
              <strong>{reference.title}</strong>
              <br />
              <small>
                <em className="whitespace-nowrap">
                  {reference.authors.map(({ fullName }) => fullName).join(', ')}
                </em>
              </small>
            </li>
          ))}
        </ul>
        <p className="my-4 text-sm italic">Click on a reference to add it to the document.</p>
        {isPdfIngestionLoading && <Spinner />}
      </PanelSection>
      <PanelSection title="Upload">
        <FileUploader handleChange={handleChange} label="Upload or drop a file right here" multiple name="file" />
        <code className="mb-auto mt-10 block text-xs font-normal">{BASE_DIR}</code>
      </PanelSection>
    </PanelWrapper>
  );
}
