import { cx } from '../../../lib/cx';
import { Author, ReferenceItem } from '../../../types/ReferenceItem';

export function ReferencesList({
  references,
  onRefClicked,
  onAuthorClicked,
}: {
  references: ReferenceItem[];
  onRefClicked: (item: ReferenceItem, openPdf?: boolean) => void;
  onAuthorClicked: (author: Author, item: ReferenceItem) => void;
}) {
  const handleClickFor: (ref: ReferenceItem, openPdf: boolean) => React.MouseEventHandler = (ref, openPdf) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRefClicked(ref, openPdf);
  };

  return (
    <ul
      className="flex flex-col items-start gap-2 self-stretch overflow-y-auto"
      data-testid={ReferencesList.name}
      role="list"
    >
      {references.map((reference) => (
        <li
          className={cx(
            'cursor-pointer',
            'flex gap-1 self-stretch px-2.5 py-1.5',
            'text-btn-txt-side-bar-item-primary',
            'rounded-default bg-btn-bg-side-bar-item-default hover:bg-btn-bg-side-bar-item-hover',
          )}
          key={reference.id}
          role="listitem"
          title={reference.title}
          onClick={handleClickFor(reference, false)}
        >
          <div className="flex flex-1 flex-col items-start justify-center">
            <h2 className="line-clamp-1 overflow-ellipsis">{reference.title}</h2>
            <div className="line-clamp-1 overflow-ellipsis">
              {reference.authors.map((author, index) => (
                <span key={index}>
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
            <div className="line-clamp-1 overflow-ellipsis">[{reference.citationKey}]</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
