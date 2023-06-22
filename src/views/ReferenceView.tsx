import './ReferenceView.css';

import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { getDerivedReferenceAtom } from '../atoms/referencesState';
import { ReferenceFileContent } from '../atoms/types/FileContent';

export function ReferenceView({ referenceId }: Pick<ReferenceFileContent, 'referenceId'>) {
  const referenceAtom = useMemo(() => getDerivedReferenceAtom(referenceId), [referenceId]);
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
