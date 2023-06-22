import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { getReferencesAtom, referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { ProgressSpinner } from '../../components/Spinner';
import { emitEvent, RefStudioEvents } from '../../events';
import { uploadFiles } from '../../filesystem';
import { ReferenceItem } from '../../types/ReferenceItem';
import { PdfInputFileUpload } from './PdfInputFileUpload';
import { ReferencesList } from './ReferencesList';

interface ReferencesPanelProps {
  onRefClicked: (item: ReferenceItem) => void;
}

export function ReferencesPanel({ onRefClicked }: ReferencesPanelProps) {
  const references = useAtomValue(getReferencesAtom);
  const setReferences = useSetAtom(setReferencesAtom);

  const [syncInProgress, setSyncInProgress] = useAtom(referencesSyncInProgressAtom);

  async function handleChange(uploadedFiles: FileList) {
    try {
      await uploadFiles(uploadedFiles);
      emitEvent(RefStudioEvents.references.ingestion.run);
    } catch (err) {
      console.error('Error uploading references', err);
    } finally {
      setSyncInProgress(false);
    }
  }

  return (
    <PanelWrapper title="References">
      <PanelSection grow title="Library">
        <div className="min-h-[200px] ">
          {references.length === 0 && (
            <div className="p-2">Welcome to your RefStudio references library. Start by uploading some PDFs.</div>
          )}

          <ReferencesList references={references} onRefClicked={onRefClicked} />
          {syncInProgress && <ProgressSpinner badge="PDF Ingestion" />}
          {!syncInProgress && (
            <PdfInputFileUpload
              className="my-2 bg-yellow-50 p-1 text-sm italic"
              onUpload={(files) => void handleChange(files)}
            />
          )}
          {import.meta.env.DEV && references.length > 0 && !syncInProgress && (
            <div className="mt-10 text-right text-xs ">
              <button className="text-gray-400 hover:underline" onClick={() => setReferences([])}>
                DEBUG: reset references store
              </button>
            </div>
          )}
        </div>
      </PanelSection>
    </PanelWrapper>
  );
}
