import { VscFile, VscFilePdf, VscTrash } from 'react-icons/vsc';

import { cx } from '../../../lib/cx';
import { Author, ReferenceItem } from '../../../types/ReferenceItem';
import { ReferencesItemStatusLabel } from '../components/ReferencesItemStatusLabel';

export function ReferencesList({
  references,
  onRefClicked,
  onAuthorClicked,
  onRemoveClicked,
}: {
  references: ReferenceItem[];
  onRefClicked: (item: ReferenceItem, openPdf?: boolean) => void;
  onAuthorClicked: (author: Author, item: ReferenceItem) => void;
  onRemoveClicked: (item: ReferenceItem) => void;
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
            title={reference.title}
            onClick={handleClickFor(reference, false)}
          >
            <div className="truncate whitespace-nowrap">{reference.title}</div>
            <div className="whitespace truncate text-xs">
              {reference.authors.map((author, index) => (
                <span key={author.fullName}>
                  {index > 0 && ', '}
                  <span
                    className="hover:underline"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      evt.preventDefault();
                      onAuthorClicked(author, reference);
                    }}
                  >
                    {author.lastName}
                  </span>
                </span>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <div className="font-mono">[{reference.citationKey}]</div>
              <ReferencesItemStatusLabel status={reference.status} />
            </div>
            {/* ACTIONS */}
            <div
              className={cx(
                'absolute right-4 top-1 rounded-md', // position: ;
                'bg-white px-1 py-1 ', // style
                'hidden gap-2 group-hover/ref-item:flex', // hidden / show on hover
              )}
            >
              <VscFile size={20} title="Open Reference" onClick={handleClickFor(reference, false)} />
              <VscFilePdf size={20} title="Open PDF" onClick={handleClickFor(reference, true)} />
              <VscTrash
                className="text-slate-600"
                size={20}
                title="Remove Reference"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemoveClicked(reference);
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
