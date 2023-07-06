import { IconType } from 'react-icons';

import { cx } from '../../../lib/cx';

export function TopActionIcon({
  action,
  icon: Icon,
  selectedCount = 0,
  disabled,
  onClick,
}: {
  action: string;
  selectedCount?: number;
  disabled?: boolean;
  icon: IconType;
  onClick?: () => void;
}) {
  return (
    <span
      aria-disabled={disabled}
      className={cx(
        'flex items-center gap-1 rounded-md px-2 py-1',
        'cursor-pointer',
        'border border-slate-400 hover:bg-slate-400 hover:text-white',
        {
          'pointer-events-none bg-slate-100 text-slate-400': disabled,
        },
      )}
      onClick={() => !disabled && onClick && onClick()}
    >
      <Icon />
      {action}
      {selectedCount > 0 && <span>({selectedCount})</span>}
    </span>
  );
}
