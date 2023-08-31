import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo } from 'react';

import { projectIdAtom } from '../../../atoms/projectState';
import { getDerivedReferenceAtom, updateReferenceAtom } from '../../../atoms/referencesState';
import { EditorIdFor, parseEditorId } from '../../../atoms/types/EditorData';
import { ReferenceItem } from '../../../types/ReferenceItem';
import ReferenceDetailsCard from './ReferenceDetailsCard';

export function ReferenceView({ referenceId }: { referenceId: EditorIdFor<'reference'> }) {
  const { id } = parseEditorId(referenceId);
  const referenceAtom = useMemo(() => getDerivedReferenceAtom(id), [id]);
  const reference = useAtomValue(referenceAtom);
  const updateReference = useSetAtom(updateReferenceAtom);
  const projectId = useAtomValue(projectIdAtom);

  const handleCellValueChanged = useCallback(() => {
    console.log('UPDATE VALUE');
    // updateReference(params.data.id, params.data, projectId);
  }, []);

  if (!reference) {
    return null;
  }

  console.log(reference);

  const formatReferenceCardData = (referencItem: ReferenceItem): Record<string, string>[] => {
    let authors = '';
    referencItem.authors.forEach((a, index) => {
      authors += (index > 0 ? ', ' : '') + a.fullName;
    });

    const referenceCard: Record<string, string>[] = [
      { 'Citation Key': '[' + referencItem.citationKey + ']' },
      { Title: referencItem.title },
      { Authors: authors },
      { Doi: referencItem.doi },
    ];

    return referenceCard;
  };

  return (
    <ReferenceDetailsCard
      referenceUpdateHandler={handleCellValueChanged}
      tableData={{
        tableBodyContent: formatReferenceCardData(reference),
        headerContentArray: ['References'],
        headerColSpan: 2,
      }}
    />
  );
}
