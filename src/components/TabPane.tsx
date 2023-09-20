import { useMemo } from 'react';
import { useContextMenu } from 'react-contexify';

import { cx } from '../lib/cx';
import { TabCloseButton } from './TabCloseButton';

export interface TabPaneItem<K extends string> {
  text: string;
  value: K;
  isDirty?: boolean;
  Icon?: React.ReactElement;
  contextMenu?: {
    menuId: string;
    ctxProps: unknown;
  };
}

interface TabPaneProps<K extends string> {
  items: TabPaneItem<K>[];
  value: K | null;
  onClick?: (value: K) => void;
  onCloseClick?: (value: K) => void;
}
export function TabPane<K extends string>({ items, value, onClick, onCloseClick }: TabPaneProps<K>) {
  const activeIndex = useMemo(() => items.findIndex((item) => item.value === value), [items, value]);

  return (
    <div
      className={cx('flex flex-1 flex-row flex-nowrap', 'bg-top-bar-bg-active', 'x-hide-scrollbars overflow-x-scroll')}
      role="tablist"
    >
      {items.map((item, index) => (
        <TabItem
          active={activeIndex === index}
          className={cx({
            'border-l border-l-top-bar-border': index > 0,
            'border-l-0': activeIndex === index,
            'rounded-bl-default border-l-0': activeIndex === index - 1,
            'rounded-br-default': activeIndex === index + 1,
          })}
          key={item.value}
          {...item}
          onClick={onClick && (() => onClick(item.value))}
          onCloseClick={onCloseClick && (() => onCloseClick(item.value))}
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
  contextMenu?: {
    menuId: string;
    ctxProps: unknown;
  };
  text: string;
  className?: string;
  isDirty?: boolean;
  Icon?: React.ReactElement;
  onClick?: () => void;
  onCloseClick?: () => void;
}
export function TabItem({ active, className, contextMenu, Icon, text, onClick, onCloseClick }: TabItemProps) {
  const { show } = useContextMenu();

  return (
    <div
      aria-selected={active}
      className={cx(
        'min-w-32 flex max-w-[11.5rem] items-center gap-2 p-2',
        'cursor-default select-none',
        'group',
        {
          'bg-top-bar-bg-inactive hover:bg-top-bar-bg-active': !active,
          'bg-top-bar-bg-active': active,
        },
        {
          'text-btn-ico-top-bar-active': active,
          'text-btn-ico-top-bar-inactive': !active,
        },
        {
          'cursor-pointer': !!onClick,
        },
        className,
      )}
      role="tab"
      onClick={
        onClick &&
        ((e) => {
          e.preventDefault();
          onClick();
        })
      }
      onContextMenu={contextMenu && ((e) => show({ event: e, id: contextMenu.menuId, props: contextMenu.ctxProps }))}
    >
      {Icon}
      <span
        className={cx('flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap', {
          'text-btn-txt-top-bar-active': active,
          'text-btn-txt-top-bar-inactive': !active,
        })}
        title={text}
      >
        {text}
      </span>
      {onCloseClick ? <TabCloseButton onClick={onCloseClick} /> : <div className="w-1" />}
    </div>
  );
}
