import React from 'react';
import { VscFile, VscFolder } from 'react-icons/vsc';

import { FileId } from '../atoms/types/FileData';
import { FileEntry } from '../atoms/types/FileEntry';
import { cx } from '../cx';

interface FileEntryTreeProps {
  files: FileEntry[];
  onClick: (fileId: FileId) => void;
  rightAction?: (file: FileId) => React.ReactNode;
  root?: boolean;
  selectedFiles: FileId[];
}

interface FileTreeNodeProps {
  fileName: string;
  isFolder?: boolean;
  onClick?: () => void;
  rightAction?: React.ReactNode;
  selected?: boolean;
}

export function FileEntryTree(props: FileEntryTreeProps) {
  const { files, root, onClick, rightAction, selectedFiles } = props;

  return (
    <div>
      <ul className={root ? 'ml-4' : 'ml-6'}>
        <li>
          {files
            // Hide DOTFILES
            .filter((file) => !file.isDotfile)
            .map((file) =>
              file.isFolder ? (
                <React.Fragment key={file.path}>
                  <FileTreeNode fileName={file.name} isFolder />
                  <FileEntryTree {...props} files={file.children} root={false} />
                </React.Fragment>
              ) : (
                <FileTreeNode
                  fileName={file.name}
                  key={file.path}
                  rightAction={rightAction ? rightAction(file.path) : undefined}
                  selected={selectedFiles.includes(file.path)}
                  onClick={() => onClick(file.path)}
                />
              ),
            )}
        </li>
      </ul>
    </div>
  );
}
export function FileTreeNode({ fileName, isFolder, onClick, rightAction, selected }: FileTreeNodeProps) {
  return (
    <div
      className={cx('mb-1 py-1', 'flex flex-row items-center gap-1', 'group', {
        'bg-slate-100': selected,
        'cursor-pointer hover:bg-slate-100': !!onClick,
      })}
      title={fileName}
      onClick={onClick}
    >
      {isFolder ? <VscFolder className="shrink-0" /> : <VscFile className="shrink-0" />}
      <span
        className={cx('flex-1 truncate', {
          'font-bold': isFolder,
        })}
      >
        {fileName}
      </span>
      {rightAction && <div className="mr-2 hidden p-0.5 hover:bg-gray-200 group-hover:block">{rightAction}</div>}
    </div>
  );
}
