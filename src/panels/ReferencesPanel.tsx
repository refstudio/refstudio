import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';

import { runPDFIngestion } from '../api/ingestion';
import { openReferenceAtom } from '../atoms/fileActions';
import { getReferencesAtom, setReferencesAtom } from '../atoms/referencesState';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { Spinner } from '../components/Spinner';
import { ensureProjectFileStructure, uploadFiles } from '../filesystem';

const BASE_DIR = await ensureProjectFileStructure();

export function ReferencesPanel() {
  const references = useAtomValue(getReferencesAtom);
  const setReferences = useSetAtom(setReferencesAtom);
  const openReference = useSetAtom(openReferenceAtom);

  const [isPdfIngestionRunning, setIsPdfIngestionRunning] = useState(false);

  async function handleChange(uploadedFiles: FileList) {
    try {
      // Upload files
      await uploadFiles(uploadedFiles);
      console.log('File uploaded with success');

      // Ingest files
      setIsPdfIngestionRunning(true);
      const updatedReferences = await runPDFIngestion();
      setReferences(updatedReferences);
      console.log('PDFs ingested with success');
    } catch (err) {
      console.error('Error uploading references', err);
    } finally {
      setIsPdfIngestionRunning(false);
    }
  }

  return (
    <PanelWrapper title="References">
      <PanelSection grow title="Library">
        <ul className="space-y-2">
          {references.map((reference) => (
            <li
              className="mb-0 cursor-pointer overflow-x-hidden text-ellipsis p-1 hover:bg-slate-200"
              key={reference.id}
              onClick={() => openReference(reference.id)}
            >
              <code className="mr-2">[{reference.citationKey}]</code>
              <strong>{reference.title}</strong>
              <br />
              <small>
                <em className="whitespace-nowrap">{reference.authors.map(({ fullName }) => fullName).join(', ')}</em>
              </small>
            </li>
          ))}
        </ul>
        {isPdfIngestionRunning && (
          <div className="flex w-full flex-col justify-center">
            <Spinner />
          </div>
        )}
      </PanelSection>
      <PanelSection title="Upload">
        <FileUploader
          disabled={isPdfIngestionRunning}
          handleChange={handleChange}
          label="Upload or drop a file right here"
          multiple
          name="file"
        />
        <code className="mb-auto mt-10 block text-xs font-normal">{BASE_DIR}</code>
      </PanelSection>
    </PanelWrapper>
  );
}
