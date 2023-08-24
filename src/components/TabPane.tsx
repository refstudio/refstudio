import { useMemo } from 'react';
import { useContextMenu } from 'react-contexify';

import { cx } from '../lib/cx';
import { TabCloseButton } from './TabCloseButton';
import { TABPANE_TAB_MENU_ID } from './TabPaneTabContextMenu';

export function TabPane<K extends string>({
  items,
  value,
  onClick,
  onCloseClick,
}: {
  items: { text: string; value: K; ctxProps?: unknown; isDirty?: boolean; Icon?: React.ReactElement }[];
  value: K | null;
  onClick(value: K): void;
  onCloseClick(value: K): void;
}) {
  const activeIndex = useMemo(() => items.findIndex((item) => item.value === value), [items, value]);

  return (
    <div
      className={cx('flex flex-1 flex-row flex-nowrap', 'bg-top-bar-bg-active', 'x-hide-scrollbars overflow-x-scroll')}
      role="tablist"
    >
      {items.map((item, index) => (
        <TabItem
          Icon={item.Icon}
          active={activeIndex === index}
          className={cx({
            'border-l border-l-top-bar-border': index > 0,
            'border-l-0': activeIndex === index,
            'rounded-bl-default border-l-0': activeIndex === index - 1,
            'rounded-br-default': activeIndex === index + 1,
          })}
          content={item.text}
          ctxProps={item.ctxProps}
          isDirty={item.isDirty}
          key={item.value}
          onClick={() => onClick(item.value)}
          onCloseClick={() => onCloseClick(item.value)}
        />
      ))}
      {items.length > 0 && (
        <div
          className={cx('grow border-l border-l-top-bar-border bg-top-bar-bg-inactive', {
            'rounded-bl-default border-l-0': activeIndex === items.length - 1,
          })}
        />
      )}
    </div>
  );
}

interface TabItemProps {
  active: boolean;
  ctxProps: unknown;
  content: React.ReactNode;
  className?: string;
  isDirty?: boolean;
  Icon?: React.ReactElement;
  onClick: () => void;
  onCloseClick: () => void;
}
export function TabItem({ active, content, isDirty, className, ctxProps, Icon, onClick, onCloseClick }: TabItemProps) {
  const { show } = useContextMenu({ id: TABPANE_TAB_MENU_ID, props: ctxProps });

  return (
    <div
      aria-selected={active}
      className={cx(
        'min-w-32 flex max-w-[11.5rem] items-center gap-2 p-2',
        'cursor-pointer select-none',
        'group',
        {
          'bg-top-bar-bg-inactive hover:bg-top-bar-bg-active': !active,
          'bg-top-bar-bg-active': active,
        },
        {
          'text-btn-ico-top-bar-active': active,
          'text-btn-ico-top-bar-inactive': !active,
        },
        className,
      )}
      role="tab"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onContextMenu={(e) => show({ event: e })}
    >
      {Icon}
      <span
        className={cx('flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap', {
          'text-btn-txt-top-bar-active': active,
          'text-btn-txt-top-bar-inactive': !active,
        })}
      >
        {content}
      </span>
      <TabCloseButton isDirty={isDirty} onClick={onCloseClick} />
    </div>
  );
}
