import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { getDerivedReferenceAtom } from '../../../atoms/referencesState';
import { EditorIdFor, parseEditorId } from '../../../atoms/types/EditorData';
import { ReferenceItem } from '../../../types/ReferenceItem';
import ReferenceDetailsCard from './ReferenceDetailsCard';

export function ReferenceView({ referenceId }: { referenceId: EditorIdFor<'reference'> }) {
  const { id } = parseEditorId(referenceId);
  const referenceAtom = useMemo(() => getDerivedReferenceAtom(id), [id]);
  const reference = useAtomValue(referenceAtom);

  if (!reference) {
    return null;
  }

  const formatReferenceCard = (referencItem: ReferenceItem): Record<string, string>[] => {
    let authors = '';
    referencItem.authors.forEach((a, index) => {
      authors += (index > 0 ? ', ' : '') + a.fullName;
    });

    const referenceCard: Record<string, string>[] = [
      { 'Citation Key': '[' + referencItem.citationKey + ']' },
      { Title: referencItem.title },
      { Authors: authors },
    ];

    return referenceCard;
  };

  return (
    <ReferenceDetailsCard
      tableData={{
        tableBodyContent: formatReferenceCard(reference),
        headerContentArray: ['References'],
        headerColSpan: 2,
      }}
    />
  );
}
