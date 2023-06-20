import { useAtomValue, useSetAtom } from 'jotai';
import { createRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { runPDFIngestion } from '../api/ingestion';
import { getReferencesAtom, setReferencesAtom } from '../atoms/referencesState';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { ProgressSpinner } from '../components/Spinner';
import { uploadFiles } from '../filesystem';
import { isNonNullish } from '../lib/isNonNullish';
import { ReferenceItem } from '../types/ReferenceItem';
import { FileDropTarget } from './FileDropTarget';

interface ReferencesPanelProps {
  onRefClicked: (item: ReferenceItem) => void;
}

export function ReferencesPanel({ onRefClicked }: ReferencesPanelProps) {
  const references = useAtomValue(getReferencesAtom);
  const setReferences = useSetAtom(setReferencesAtom);

  const inputRef = createRef<HTMLInputElement>();

  const [isPdfIngestionRunning, setIsPdfIngestionRunning] = useState(false);

  async function handleChange(uploadedFiles: FileList) {
    try {
      // Upload files
      await uploadFiles(uploadedFiles);
      console.log('File uploaded with success');

      // Ingest files
      setIsPdfIngestionRunning(true);

      // Merge new files
      const newReferences = Array.from(uploadedFiles)
        .map((file) => {
          const existingRef = references.find((ref) => ref.filename === file.name);
          if (existingRef) {
            return null;
          }
          return {
            id: file.name,
            citationKey: '...',
            title: file.name,
            filename: file.name,
            authors: [{ fullName: 'Unknown' }],
          } as ReferenceItem;
        })
        .filter(isNonNullish);
      setReferences([...references, ...newReferences]);

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
        <DndProvider backend={HTML5Backend}>
          <FileDropTarget onDrop={(files) => void handleChange(files)}>
            <div className="min-h-[200px] ">
              {references.length === 0 && (
                <div className="p-2">Welcome to your RefStudio references library. Start by uploading some PDFs.</div>
              )}

              <ul className="space-y-2">
                {references.map((reference) => (
                  <li
                    className="mb-0 cursor-pointer overflow-x-hidden text-ellipsis p-1 hover:bg-slate-200"
                    key={reference.id}
                    onClick={() => onRefClicked(reference)}
                  >
                    <code className="mr-2">[{reference.citationKey}]</code>
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
              {isPdfIngestionRunning && <ProgressSpinner badge="PDF Ingestion" />}
              {!isPdfIngestionRunning && (
                <div className="my-2 bg-yellow-50 p-1 text-sm italic">
                  <input
                    accept="application/pdf"
                    className="hidden"
                    multiple
                    ref={inputRef}
                    type="file"
                    onChange={(e) => e.currentTarget.files && void handleChange(e.currentTarget.files)}
                  />
                  <strong>TIP:</strong> Click{' '}
                  <span className="cursor-pointer underline" onClick={() => inputRef.current?.click()}>
                    here
                  </span>{' '}
                  or drag/drop PDF files here for upload.
                </div>
              )}
              {references.length > 0 && !isPdfIngestionRunning && (
                <div className="mt-10 text-right text-xs ">
                  <button className="text-gray-400 hover:underline" onClick={() => setReferences([])}>
                    DEBUG: reset references store
                  </button>
                </div>
              )}
            </div>
          </FileDropTarget>
        </DndProvider>
      </PanelSection>
    </PanelWrapper>
  );
}
