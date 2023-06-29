import { useAtomValue, useSetAtom } from 'jotai';
import { VscDesktopDownload, VscNewFile, VscOpenPreview } from 'react-icons/vsc';

import { openFileEntryAtom, openReferenceAtom } from '../../../atoms/editorActions';
import { getReferencesAtom } from '../../../atoms/referencesState';
import { PanelSection } from '../../../components/PanelSection';
import { PanelWrapper } from '../../../components/PanelWrapper';
import { emitEvent, RefStudioEvents } from '../../../events';
import { getUploadsDir } from '../../../io/filesystem';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { ResetReferencesInstructions } from '../components/ResetReferencesInstructions';
import { UploadTipInstructions } from '../components/UploadTipInstructions';
import { ReferencesList } from './ReferencesList';

export function ReferencesPanel() {
  const references = useAtomValue(getReferencesAtom);
  const openReference = useSetAtom(openReferenceAtom);
  const openFileEntry = useSetAtom(openFileEntryAtom);

  const handleAddReferences = () => {
    emitEvent(RefStudioEvents.menu.references.upload);
  };

  const handleOpenReferences = () => {
    emitEvent(RefStudioEvents.menu.references.open);
  };

  const handleExportReferences = () => {
    throw new Error('NOT IMPLEMENTED');
  };

  const handleRefClicked = async (reference: ReferenceItem, openPdf?: boolean) => {
    if (openPdf) {
      const path = `${await getUploadsDir()}/${reference.filename}`;
      openFileEntry({
        path,
        name: reference.filename,
        isFile: true,
        isDotfile: false,
        fileExtension: 'pdf',
        isFolder: false,
      });
    } else {
      openReference(reference.id);
    }
  };

  return (
    <PanelWrapper title="References">
      <PanelSection
        grow
        rightIcons={[
          { key: 'new', Icon: VscNewFile, title: 'Add References', onClick: handleAddReferences },
          { key: 'open', Icon: VscOpenPreview, title: 'Open References', onClick: handleOpenReferences },
          {
            key: 'export',
            Icon: VscDesktopDownload,
            title: 'Export References (NOT IMPLEMENTED)',
            className: 'text-slate-600/50',
            onClick: handleExportReferences,
          },
        ]}
        title="Library"
      >
        <div className="min-h-[200px] ">
          {references.length === 0 && (
            <div className="p-2">Welcome to your RefStudio references library. Start by uploading some PDFs.</div>
          )}

          <ReferencesList
            references={references}
            onRefClicked={(ref, openPdf) => void handleRefClicked(ref, openPdf)}
          />
          <UploadTipInstructions />
          <ResetReferencesInstructions />
        </div>
      </PanelSection>
    </PanelWrapper>
  );
}
