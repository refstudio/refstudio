import React, { useState } from 'react';
import { IconType } from 'react-icons';
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc';

import { cx } from '../lib/cx';

export function PanelSection({
  title,
  children,
  grow = false,
  rightIcons = [],
}: {
  title: string;
  children: React.ReactNode;
  grow?: boolean;
  rightIcons?: { key: string; Icon: IconType; title?: string; onClick: () => void }[];
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
          {rightIcons.map(({ key, Icon, title: iconTitle, onClick }) => (
            <Icon
              className="cursor-pointer hover:bg-slate-200"
              key={key}
              size={20}
              title={iconTitle}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
              }}
            />
          ))}
        </div>
      </div>
      {expanded && <div className={cx({ 'overflow-y-auto': grow })}>{children}</div>}
    </div>
  );
}
