import { useAtomValue, useSetAtom } from 'jotai';
import { VscNewFile, VscOpenPreview } from 'react-icons/vsc';

import { openReferencesAtom } from '../../atoms/fileActions';
import { getReferencesAtom, referencesSyncInProgressAtom, setReferencesAtom } from '../../atoms/referencesState';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { emitEvent, RefStudioEvents } from '../../events';
import { ReferenceItem } from '../../types/ReferenceItem';
import { ReferencesList } from './ReferencesList';

interface ReferencesPanelProps {
  onRefClicked: (item: ReferenceItem) => void;
}

export function ReferencesPanel({ onRefClicked }: ReferencesPanelProps) {
  const references = useAtomValue(getReferencesAtom);
  const openReferences = useSetAtom(openReferencesAtom);

  const handleAddReferences = () => {
    emitEvent(RefStudioEvents.menu.references.upload);
  };

  return (
    <PanelWrapper title="References">
      <PanelSection
        grow
        rightIcons={[
          { key: 'new', Icon: VscNewFile, title: 'Add References', onClick: handleAddReferences },
          { key: 'open', Icon: VscOpenPreview, title: 'Open References', onClick: openReferences },
        ]}
        title="Library"
      >
        <div className="min-h-[200px] ">
          {references.length === 0 && (
            <div className="p-2">Welcome to your RefStudio references library. Start by uploading some PDFs.</div>
          )}

          <ReferencesList references={references} onRefClicked={onRefClicked} />
          <UploadTipInstructions />
          <ResetReferencesInstructions />
        </div>
      </PanelSection>
    </PanelWrapper>
  );
}

function UploadTipInstructions() {
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);

  if (syncInProgress) {
    return null;
  }

  return (
    <div className="my-2 bg-yellow-50 p-1 text-sm italic">
      <strong>TIP:</strong> Click{' '}
      <span className="cursor-pointer underline" onClick={() => emitEvent(RefStudioEvents.menu.references.upload)}>
        here
      </span>{' '}
      or drag/drop PDF files for upload.
    </div>
  );
}

function ResetReferencesInstructions() {
  const references = useAtomValue(getReferencesAtom);
  const setReferences = useSetAtom(setReferencesAtom);
  const syncInProgress = useAtomValue(referencesSyncInProgressAtom);
  if (!import.meta.env.DEV) {
    return null;
  }
  if (references.length === 0) {
    return null;
  }
  if (syncInProgress) {
    return null;
  }

  return (
    <div className="mt-10 text-right text-xs ">
      <button className="text-gray-400 hover:underline" onClick={() => setReferences([])}>
        DEBUG: reset references store
      </button>
    </div>
  );
}
