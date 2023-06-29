import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { VscDesktopDownload, VscNewFile, VscOpenPreview } from 'react-icons/vsc';

import { openFileEntryAtom, openReferenceAtom } from '../../../atoms/editorActions';
import { getReferencesAtom } from '../../../atoms/referencesState';
import { PanelSection } from '../../../components/PanelSection';
import { PanelWrapper } from '../../../components/PanelWrapper';
import { emitEvent, RefStudioEvents } from '../../../events';
import { useDebouncedCallback } from '../../../hooks/useDebouncedCallback';
import { getUploadsDir } from '../../../io/filesystem';
import { ReferenceItem } from '../../../types/ReferenceItem';
import { ResetReferencesInstructions } from '../components/ResetReferencesInstructions';
import { UploadTipInstructions } from '../components/UploadTipInstructions';
import { ReferencesList } from './ReferencesList';

export function ReferencesPanel() {
  const references = useAtomValue(getReferencesAtom);
  const openReference = useSetAtom(openReferenceAtom);
  const openFileEntry = useSetAtom(openFileEntryAtom);

  const [visibleReferences, setVisibleReferences] = useState(references);

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

  const handleFilterChanged = (filter: string) => {
    console.log('Filter by', filter);
    setVisibleReferences(
      references.filter((reference) => {
        const text =
          reference.title.toLowerCase() + //
          reference.authors.map((a) => a.fullName.toLowerCase()).join(',');
        return text.includes(filter.toLowerCase());
      }),
    );
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
            onClick: () => void handleExportReferences(),
          },
        ]}
        title="Library"
      >
        <div className="min-h-[200px] ">
          {references.length === 0 && (
            <div className="p-2">Welcome to your RefStudio references library. Start by uploading some PDFs.</div>
          )}

          <FilterInput placeholder="Filter (e.g. title, author)" onChange={handleFilterChanged} />
          <ReferencesList
            references={visibleReferences}
            onRefClicked={(ref, openPdf) => void handleRefClicked(ref, openPdf)}
          />
          <UploadTipInstructions />
          <ResetReferencesInstructions />
        </div>
      </PanelSection>
    </PanelWrapper>
  );
}

function FilterInput({ placeholder, onChange }: { placeholder: string; onChange: (filter: string) => void }) {
  const [value, setValue] = useState('');
  const debouncedOnChange = useDebouncedCallback(onChange, 200);

  return (
    <div className="relative mx-1 flex">
      <input
        className="grow border border-slate-400 bg-slate-100 px-4 py-2 outline-none"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={(evt) => {
          setValue(evt.target.value);
          debouncedOnChange(evt.target.value);
        }}
      />
    </div>
  );
}
