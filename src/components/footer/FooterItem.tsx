import React from 'react';

import { cx } from '../../lib/cx';

export function FooterItem({
  className,
  title,
  icon,
  hidden = false,
  text,
  onClick,
}: {
  className?: string;
  title?: string;
  hidden?: boolean;
  icon: React.ReactNode;
  text?: React.ReactNode;
  onClick?: () => void;
}) {
  if (hidden) {
    return null;
  }

  return (
    <span
      className={cx(
        'flex select-none items-center gap-2 self-stretch px-2 py-1',
        {
          'cursor-pointer hover:bg-slate-700': onClick,
        },
        className,
      )}
      role="listitem"
      title={title}
      onClick={onClick}
    >
      {icon}
      {text && <span>{text}</span>}
    </span>
  );
}
