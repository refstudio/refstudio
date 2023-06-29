import { cx } from '../lib/cx';
import { TabCloseButton } from './TabCloseButton';

export function TabPane<K extends string>({
  items,
  value,
  onClick,
  onCloseClick,
}: {
  items: { text: string; value: K; isDirty?: boolean }[];
  value?: K;
  onClick(value: K): void;
  onCloseClick(value: K): void;
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
          isDirty={item.isDirty}
          key={item.value}
          onClick={() => onClick(item.value)}
          onCloseClick={() => onCloseClick(item.value)}
        />
      ))}
    </div>
  );
}

function TabItem({
  active,
  content,
  isDirty,
  onClick,
  onCloseClick,
}: {
  active: boolean;
  content: React.ReactNode;
  isDirty?: boolean;
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
      <TabCloseButton isDirty={isDirty} onClick={onCloseClick} />
    </div>
  );
}
