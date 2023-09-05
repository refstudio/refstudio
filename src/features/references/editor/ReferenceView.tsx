import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo } from 'react';

import { projectIdAtom } from '../../../atoms/projectState';
import { getDerivedReferenceAtom, updateReferenceAtom } from '../../../atoms/referencesState';
import { EditorIdFor, parseEditorId } from '../../../atoms/types/EditorData';
import { ReferenceItem } from '../../../types/ReferenceItem';
import ReferenceDetailsCard from './ReferenceDetailsCard';
import { TableDataContext } from './ReferenceDetailsCard.Context';
import { ReferenceDetailsCardRow } from './ReferenceEditorTypes';

export function ReferenceView({ referenceId }: { referenceId: EditorIdFor<'reference'> }) {
  const { id } = parseEditorId(referenceId);
  const referenceAtom = useMemo(() => getDerivedReferenceAtom(id), [id]);
  const reference = useAtomValue(referenceAtom);
  const updateReference = useSetAtom(updateReferenceAtom);
  const projectId = useAtomValue(projectIdAtom);

  const handleCellValueChanged = useCallback(
    (params: ReferenceItem) => void updateReference(projectId, params.id, params),
    [updateReference, projectId],
  );

  if (!reference) {
    return null;
  }

  const formatReferenceCardData = (referencItem: ReferenceItem): ReferenceDetailsCardRow[] => {
    let authors = '';
    referencItem.authors.forEach((a, index) => {
      authors += (index > 0 ? ', ' : '') + a.fullName;
    });

    const referenceCard: ReferenceDetailsCardRow[] = [
      {
        id: 'citationKey',
        title: 'Citation Key',
        value: referencItem.citationKey,
        editable: true,
      },
      {
        id: 'title',
        title: 'Title',
        value: referencItem.title,
        editable: true,
      },
      {
        id: 'authors',
        title: 'Authors',
        value: authors,
        editable: false,
      },
      {
        id: 'doi',
        title: 'Doi',
        value: referencItem.doi,
        editable: true,
      },
    ];

    return referenceCard;
  };

  const cloneEditableReferenceItem = <T extends object>(source: T): T => ({
    ...source,
  });

  return (
    <TableDataContext.Provider
      value={{
        tableBodyContent: formatReferenceCardData(reference),
        headerContentArray: ['References'],
        headerColSpan: 2,
      }}
    >
      <ReferenceDetailsCard
        editableReferenceItem={cloneEditableReferenceItem(reference)}
        handleCellValueChanged={handleCellValueChanged}
      />
    </TableDataContext.Provider>
  );
}
