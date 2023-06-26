import { IconType } from 'react-icons';

import { cx } from '../cx';

export interface RightAction {
  title?: string;
  onClick: (evt: React.MouseEvent) => void;
  VscIcon: IconType;
}

interface FileNodeProps {
  bold?: boolean;
  fileName: string;
  onClick: () => void;
  paddingLeft: string;
  rightAction?: RightAction;
  selected?: boolean;
  VscIcon: IconType;
}

export function FileNode({ bold, fileName, onClick, paddingLeft, rightAction, selected, VscIcon }: FileNodeProps) {
  return (
    <div
      className={cx('cursor-pointer select-none', 'flex flex-row items-center gap-1', 'group', {
        'bg-slate-200': selected,
        'hover:bg-slate-100': !selected,
      })}
      style={{ paddingLeft }}
      onClick={onClick}
    >
      <div className="flex h-full w-full items-center gap-1">
        <VscIcon />
        <div
          className={cx('flex-1 truncate', {
            'font-semibold': bold,
          })}
        >
          {fileName}
        </div>
        {rightAction && (
          <div
            className="mr-2 hidden rounded-md p-0.5 hover:bg-gray-300 group-hover:block"
            role="button"
            title={rightAction.title}
            onClick={rightAction.onClick}
          >
            <rightAction.VscIcon />
          </div>
        )}
      </div>
    </div>
  );
}
