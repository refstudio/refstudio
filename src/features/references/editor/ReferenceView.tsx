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

  const handleReferenceChanged = useCallback(
    (params: ReferenceItem) => void updateReference(projectId, params.id, params),
    [updateReference, projectId],
  );

  if (!reference) {
    return null;
  }

  return <ReferenceDetailsCard handleReferenceChanged={handleReferenceChanged} reference={reference} />;
}
