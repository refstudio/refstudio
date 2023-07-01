import { useAtomValue } from 'jotai';
import { VscNewFile, VscOpenPreview } from 'react-icons/vsc';

import { getReferencesAtom } from '../../../atoms/referencesState';
import { PanelSection } from '../../../components/PanelSection';
import { PanelWrapper } from '../../../components/PanelWrapper';
import { emitEvent } from '../../../events';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { ResetReferencesInstructions } from '../components/ResetReferencesInstructions';
import { UploadTipInstructions } from '../components/UploadTipInstructions';
import { ReferencesList } from './ReferencesList';

interface ReferencesPanelProps {
  onRefClicked: (item: ReferenceItem) => void;
}

export function ReferencesPanel({ onRefClicked }: ReferencesPanelProps) {
  const references = useAtomValue(getReferencesAtom);

  const handleAddReferences = () => {
    emitEvent('refstudio://menu/references/upload');
  };

  const handleOpenReferences = () => {
    emitEvent('refstudio://menu/references/open');
  };

  return (
    <PanelWrapper title="References">
      <PanelSection
        grow
        rightIcons={[
          { key: 'new', Icon: VscNewFile, title: 'Add References', onClick: handleAddReferences },
          { key: 'open', Icon: VscOpenPreview, title: 'Open References', onClick: handleOpenReferences },
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
