import React, { useState } from 'react';
import { IconType } from 'react-icons';
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc';

import { cx } from '../lib/cx';

interface Icon {
  key: string;
  disabled?: boolean;
  Icon: IconType;
  title?: string;
  className?: string;
  onClick: () => void;
}

export function PanelSection({
  title,
  children,
  grow = false,
  rightIcons = [],
}: {
  title: string;
  children: React.ReactNode;
  grow?: boolean;
  rightIcons?: Icon[];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={cx('flex flex-col', 'group/panel-section ', {
        'flex-shrink-0': !grow, // Take the component's height without shrinking
        'flex-grow overflow-hidden': grow, // Can grow
      })}
    >
      <div
        className={cx(
          'flex flex-row items-center gap-1', //
          'mb-1 cursor-pointer pl-1 text-sm',
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <VscChevronDown /> : <VscChevronRight />}
        <span className="font-bold uppercase">{title}</span>
        <div
          className={cx(
            'ml-auto mr-2 text-xs ', //
            'flex gap-2',
            'invisible group-hover/panel-section:visible',
          )}
        >
          {rightIcons.map(({ key, disabled, Icon, title: iconTitle, className, onClick }) => (
            <Icon
              aria-disabled={disabled}
              className={cx('cursor-pointer', className, {
                disabled,
                'text-slate-600/50': disabled,
                'hover:bg-slate-200': !disabled,
              })}
              key={key}
              size={20}
              title={iconTitle}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) {
                  onClick();
                }
              }}
            />
          ))}
        </div>
      </div>
      {expanded && <div className={cx({ 'z-10 overflow-y-auto': grow })}>{children}</div>}
    </div>
  );
}
