import './ReferenceView.css';

import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { getDerivedReferenceAtom } from '../../../atoms/referencesState';
import { EditorIdFor, parseEditorId } from '../../../atoms/types/EditorData';

export function ReferenceView({ referenceId }: { referenceId: EditorIdFor<'reference'> }) {
  const { id } = parseEditorId(referenceId);
  const referenceAtom = useMemo(() => getDerivedReferenceAtom(id), [id]);
  const reference = useAtomValue(referenceAtom);

  if (!reference) {
    return null;
  }

  return (
    <table className="reference-details">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Citation key</td>
          <td>[{reference.citationKey}]</td>
        </tr>
        <tr>
          <td>Title</td>
          <td>{reference.title}</td>
        </tr>
        <tr>
          <td>Authors</td>
          <td>{reference.authors.map(({ fullName }) => fullName).join(', ')}</td>
        </tr>
      </tbody>
    </table>
  );
}
