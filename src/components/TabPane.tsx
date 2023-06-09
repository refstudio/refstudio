import { VscClose } from 'react-icons/vsc';

import { cx } from '../cx';

export function TabPane({
  items,
  value,
  onClick,
  onCloseClick,
}: {
  items: { key: string; text: string; value: string }[];
  value?: string;
  onClick(value: string): void;
  onCloseClick(value: string): void;
}) {
  return (
    <div
      className={cx(
        'flex flex-1 flex-row flex-nowrap',
        'border-b border-b-slate-200',
        'x-hide-scrollbars overflow-x-scroll',
      )}
      role="tablist"
    >
      {items.map((item) => (
        <TabItem
          active={item.value === value}
          content={item.text}
          key={item.key}
          onClick={() => onClick(item.value)}
          onCloseClick={() => onCloseClick(item.value)}
        />
      ))}
    </div>
  );
}

export function TabItem({
  active,
  content,
  onClick,
  onCloseClick,
}: {
  active: boolean;
  content: React.ReactNode;
  onClick: () => void;
  onCloseClick: () => void;
}) {
  return (
    <div
      aria-selected={active}
      className={cx(
        'inline-flex items-center justify-between gap-2 px-2 pb-1 pt-2',
        'cursor-pointer select-none whitespace-nowrap',
        'border-r border-r-slate-200 first:border-l first:border-l-slate-200',
        'group',
        {
          'border-t-2 border-t-slate-200 hover:bg-slate-100': !active,
          'border-t-2 border-t-primary bg-slate-200': active,
        },
      )}
      role="tab"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <span>{content}</span>
      <VscClose
        className="invisible group-hover:visible"
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          onCloseClick();
        }}
      />
    </div>
  );
}
