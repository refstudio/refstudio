import { IconType } from 'react-icons';

import { useFileExplorerContextMenu } from '../application/sidebar/fileExplorerContextMenu/useFileExplorerContextMenu';
import { cx } from '../lib/cx';
import { FileNameInput } from './FileNameInput';

export interface RightAction {
  title?: string;
  onClick: (evt: React.MouseEvent) => void;
  VscIcon: IconType;
}

interface FileNodePropsBase {
  bold?: boolean;
  contextMenuId?: string;
  fileId: string;
  fileName: string;
  onClick: () => void;
  paddingLeft: string;
  rightAction?: RightAction;
  selected?: boolean;
  VscIcon: IconType;
}

interface NonEditableFileNodeProps extends FileNodePropsBase {
  isEditMode?: false;
}

interface EditableFileNodeProps extends FileNodePropsBase {
  isEditMode: true;
  isNameValid: (name: string) => boolean;
  onFileRename: (newName: string) => void;
  onCancelRename: () => void;
}

type FileNodeProps = NonEditableFileNodeProps | EditableFileNodeProps;

export function FileNode({
  bold,
  contextMenuId = '',
  fileName,
  fileId,
  onClick,
  paddingLeft,
  rightAction,
  selected,
  VscIcon,
  ...editableProps
}: FileNodeProps) {
  const show = useFileExplorerContextMenu(contextMenuId, { id: fileId });
  return (
    <div
      className={cx('cursor-pointer select-none', 'flex flex-row items-center gap-1 py-1', 'group', {
        'bg-slate-100': selected,
        'hover:bg-slate-200': !selected,
      })}
      style={{ paddingLeft }}
      onClick={onClick}
      onContextMenu={show}
    >
      <div className="flex h-full w-full items-center gap-1">
        <VscIcon />
        {editableProps.isEditMode ? (
          <FileNameInput
            fileName={fileName}
            isNameValid={editableProps.isNameValid}
            onCancel={editableProps.onCancelRename}
            onSubmit={editableProps.onFileRename}
          />
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
