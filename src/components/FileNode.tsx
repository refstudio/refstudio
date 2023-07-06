import { IconType } from 'react-icons';

import { useFileExplorerContextMenu } from '../application/sidebar/fileExplorerContextMenu/useFileExplorerContextMenu';
import { cx } from '../lib/cx';
import { FileNameInput } from './FileNameInput';

export interface RightAction {
  title?: string;
  onClick: (evt: React.MouseEvent) => void;
  VscIcon: IconType;
}

interface FileNodeProps {
  bold?: boolean;
  contextMenuId?: string;
  fileId: string;
  fileName: string;
  isEditMode?: boolean;
  onClick: () => void;
  onFileRename: (newName: string) => void;
  onCancelRename: () => void;
  paddingLeft: string;
  rightAction?: RightAction;
  selected?: boolean;
  VscIcon: IconType;
}

export function FileNode({
  bold,
  contextMenuId = '',
  fileName,
  fileId,
  isEditMode,
  onClick,
  onCancelRename,
  onFileRename,
  paddingLeft,
  rightAction,
  selected,
  VscIcon,
}: FileNodeProps) {
  const show = useFileExplorerContextMenu(contextMenuId, { id: fileId });
  return (
    <div
      className={cx('cursor-pointer select-none', 'flex flex-row items-center gap-1 py-1 pr-1', 'group', {
        'bg-slate-100': selected,
        'hover:bg-slate-200': !selected,
      })}
      style={{ paddingLeft }}
      onClick={onClick}
      onContextMenu={show}
    >
      <div className="flex h-full w-full items-center gap-1">
        <VscIcon />
        {isEditMode ? (
          <FileNameInput fileName={fileName} onCancel={onCancelRename} onSubmit={onFileRename} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
