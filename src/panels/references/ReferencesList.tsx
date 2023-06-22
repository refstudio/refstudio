import { ReferenceItem } from '../../types/ReferenceItem';

export function ReferencesList({
  references,
  onRefClicked,
}: {
  references: ReferenceItem[];
  onRefClicked: (item: ReferenceItem) => void;
}) {
  return (
    <ul className="space-y-2" role="list">
      {references.map((reference) => (
        <li
          className="mb-0 cursor-pointer overflow-x-hidden text-ellipsis p-1 hover:bg-slate-200"
          key={reference.id}
          role="listitem"
          onClick={() => onRefClicked(reference)}
        >
          <code className="mr-2">[{reference.citationKey}]</code>
          <strong>{reference.title}</strong>
          <br />
          <small>
            <em className="whitespace-nowrap">{reference.authors.map(({ fullName }) => fullName).join(', ')}</em>
          </small>
        </li>
      ))}
    </ul>
  );
}
