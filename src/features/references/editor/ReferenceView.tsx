import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo } from 'react';

import { projectIdAtom } from '../../../atoms/projectState';
import { getDerivedReferenceAtom, updateReferenceAtom } from '../../../atoms/referencesState';
import { EditorIdFor, parseEditorId } from '../../../atoms/types/EditorData';
import { ReferenceItem } from '../../../types/ReferenceItem';
import ReferenceDetailsCard from './ReferenceDetailsCard';
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
      },
      {
        id: 'title',
        title: 'Title',
        value: referencItem.title,
      },
      {
        id: 'authors',
        title: 'Authors',
        value: authors,
      },
      {
        id: 'doi',
        title: 'Doi',
        value: referencItem.doi,
      },
    ];

    return referenceCard;
  };

  const cloneEditableReferenceItem = <T extends object>(source: T): T => ({
    ...source,
  });

  return (
    <ReferenceDetailsCard
      editableReferenceItem={cloneEditableReferenceItem(reference)}
      referenceUpdateHandler={handleCellValueChanged}
      tableData={{
        tableBodyContent: formatReferenceCardData(reference),
        headerContentArray: ['References'],
        headerColSpan: 2,
      }}
    />
  );
}
