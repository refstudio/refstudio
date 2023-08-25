import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { openReferenceAtom, openReferencePdfAtom, openReferencesAtom } from '../../../atoms/editorActions';
import { getReferencesAtom } from '../../../atoms/referencesState';
import { PanelWrapper } from '../../../components/PanelWrapper';
import { SearchBar } from '../../../components/SearchBar';
import { emitEvent } from '../../../events';
import { Author, ReferenceItem } from '../../../types/ReferenceItem';
import { ExportIcon, TableIcon } from '../components/icons';
import { ReferencesList } from './ReferencesList';

export function ReferencesPanel() {
  const references = useAtomValue(getReferencesAtom);
  const openReference = useSetAtom(openReferenceAtom);
  const openReferences = useSetAtom(openReferencesAtom);
  const openReferencePdf = useSetAtom(openReferencePdfAtom);

  const [visibleReferences, setVisibleReferences] = useState(references);
  useEffect(() => {
    setVisibleReferences(references);
  }, [references]);

  const handleOpenReferences = () => {
    emitEvent('refstudio://menu/references/open');
  };

  const handleExportReferences = () => {
    emitEvent('refstudio://menu/references/export');
  };

  const handleRefClicked = (reference: ReferenceItem, openPdf?: boolean) => {
    if (openPdf) {
      openReferencePdf(reference.id);
    } else {
      openReference(reference.id);
    }
  };

  const handleAuthorClicked = (author: Author) => openReferences(author.lastName);

  const handleFilterChanged = (filter: string) => {
    if (filter.trim() === '') {
      return setVisibleReferences(references);
    }

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
    <PanelWrapper
      actions={[
        {
          key: 'new',
          title: 'Open References',
          Icon: <TableIcon />,
          onClick: handleOpenReferences,
        },
        {
          key: 'export',
          disabled: references.length === 0,
          title: 'Export References',
          Icon: <ExportIcon />,
          onClick: handleExportReferences,
        },
      ]}
      title="References"
    >
      <div className="flex flex-1 flex-col items-start gap-4 self-stretch p-4 pt-2">
        <SearchBar placeholder="Filter author/title..." onChange={handleFilterChanged} />
        <ReferencesList
          references={visibleReferences}
          onAuthorClicked={handleAuthorClicked}
          onRefClicked={handleRefClicked}
        />
      </div>
    </PanelWrapper>
  );
}
