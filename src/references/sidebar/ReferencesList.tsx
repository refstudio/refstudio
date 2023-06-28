import { ReferenceItem } from '../../types/ReferenceItem';

export function ReferencesList({
  references,
  onRefClicked,
}: {
  references: ReferenceItem[];
  onRefClicked: (item: ReferenceItem) => void;
}) {
  return (
    <div className="" data-testid={ReferencesList.name}>
      <ul className="space-y-4" role="list">
        {references.map((reference) => (
          <li
            className="cursor-pointer bg-white p-1 px-4 even:bg-slate-50 hover:bg-slate-200"
            key={reference.id}
            role="listitem"
            onClick={() => onRefClicked(reference)}
          >
            <div className="truncate whitespace-nowrap">{reference.title}</div>
            <div className="text-xs">{reference.authors.map(({ fullName }) => fullName).join(', ')}</div>
            <div className="text-xs">{reference.citationKey}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
