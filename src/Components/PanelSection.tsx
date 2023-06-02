import React, { useState } from 'react';
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc';

import { cx } from '../cx';

export function PanelSection({
  title,
  children,
  grow = false,
}: {
  title: string;
  children: React.ReactNode;
  grow?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className={cx('flex flex-col overflow-hidden px-2', {
        'flex-shrink-0': !grow, // Take the component's height without shrinking
        'flex-grow': grow, // Can grow
      })}
    >
      <div
        className={cx(
          'flex flex-row items-center gap-1', //
          'mb-2 cursor-pointer text-sm',
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <VscChevronDown /> : <VscChevronRight />}
        <span className="font-bold uppercase">{title}</span>
        <div className="ml-auto text-xs">{/* NOTE: This is the placeholder for actions */}</div>
      </div>
      {expanded && <div className="overflow-scroll">{children}</div>}
    </div>
  );
}
