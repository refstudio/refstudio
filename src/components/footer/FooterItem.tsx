import React from 'react';

import { cx } from '../../cx';

export function FooterItem({ icon, text, onClick }: { icon: React.ReactNode; text: string; onClick?: () => void }) {
  return (
    <span
      className={cx('flex select-none items-center gap-2 px-2 py-1', {
        'cursor-pointer hover:bg-slate-700': onClick,
      })}
      role="listitem"
      onClick={onClick}
    >
      {icon} <span>{text}</span>
    </span>
  );
}
