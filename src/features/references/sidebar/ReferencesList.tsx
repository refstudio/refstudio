import { VscFile, VscFilePdf, VscTrash } from 'react-icons/vsc';

import { assertNever } from '../../../lib/assertNever';
import { cx } from '../../../lib/cx';
import { ReferenceItem, ReferenceItemStatus } from '../../../types/ReferenceItem';

export function ReferencesList({
  references,
  onRefClicked,
}: {
  references: ReferenceItem[];
  onRefClicked: (item: ReferenceItem, openPdf?: boolean) => void;
}) {
  const handleClickFor: (ref: ReferenceItem, openPdf: boolean) => React.MouseEventHandler = (ref, openPdf) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRefClicked(ref, openPdf);
  };

  return (
    <div className="" data-testid={ReferencesList.name}>
      <ul className="space-y-4" role="list">
        {references.map((reference) => (
          <li
            className="group/ref-item relative cursor-pointer bg-white p-1 px-4 even:bg-slate-50 hover:bg-slate-200"
            key={reference.id}
            role="listitem"
            onClick={handleClickFor(reference, false)}
          >
            <div className="truncate whitespace-nowrap">{reference.title}</div>
            <div className="whitespace truncate text-xs">
              {reference.authors.map(({ lastName }) => lastName).join(', ')}
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <div className="font-mono">[{reference.citationKey}]</div>
              <ReferencesItemStatusLabel status={reference.status} />
            </div>
            {/* ACTIONS */}
            <div
              className={cx(
                'absolute right-1 top-1', // position
                'bg-white px-1 py-1 ', // style
                'hidden gap-2 group-hover/ref-item:flex', // hidden / show on hover
              )}
            >
              <VscFile size={20} title="Open Reference" onClick={handleClickFor(reference, false)} />
              <VscFilePdf size={20} title="Open PDF" onClick={handleClickFor(reference, true)} />
              <VscTrash className="text-slate-600/50" size={20} title="NOT IMPLEMENTED" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReferencesItemStatusLabel({ status }: { status: ReferenceItemStatus }) {
  switch (status) {
    case 'processing':
      return (
        <span className="rounded-md border border-orange-400 bg-white/60 px-1 py-0.5 uppercase text-orange-400">
          processing
        </span>
      );
    case 'failure':
      return (
        <span className="rounded-md border border-red-400 bg-white/60 px-1 py-0.5 uppercase text-red-400">failure</span>
      );
    case 'complete':
      return (
        <span className="rounded-md border border-green-400 bg-white/60 px-1 py-0.5 uppercase text-green-400">
          complete
        </span>
      );
    default:
      assertNever(status);
  }
}
