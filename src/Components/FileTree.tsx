import { FileEntry } from '@tauri-apps/api/fs';
import { VscFile, VscFolder } from 'react-icons/vsc';

import { cx } from '../cx';

interface FileTreeBaseProps {
  root?: boolean;
  files: FileEntry[];
  file?: FileEntry;
  selectedFiles: FileEntry[];
  onClick: (file: FileEntry) => void;
  rightAction?: (file: FileEntry) => React.ReactNode;
}
export function FileTree({ files, root, ...props }: FileTreeBaseProps) {
  return (
    <div>
      <ul className={root ? 'ml-4' : 'ml-6'}>
        {files.map((file) => (
          <FileTreeNode file={file} files={files} key={file.path} {...props} />
        ))}
      </ul>
    </div>
  );
}
function FileTreeNode({ file, onClick, rightAction, selectedFiles }: FileTreeBaseProps) {
  if (!file) {
    return null;
  }
  const isFolder = !!file.children;

  // Hide DOT_FILES
  if (file.name?.startsWith('.')) {
    return null;
  }

  return (
    <li>
      <div
        className={cx('mb-1 py-1', 'flex flex-row items-center gap-1', 'group', {
          'bg-slate-100': selectedFiles.some((f) => f.path === file.path),
          'cursor-pointer hover:bg-slate-100': !isFolder,
        })}
        title={file.name}
        onClick={() => !isFolder && onClick(file)}
      >
        {isFolder ? <VscFolder className="shrink-0" /> : <VscFile className="shrink-0" />}
        <span
          className={cx('flex-1 truncate', {
            'font-bold': isFolder,
          })}
        >
          {file.name}
        </span>
        {rightAction && (
          <div className="mr-2 hidden p-0.5 hover:bg-gray-200 group-hover:block">{rightAction(file)}</div>
        )}
      </div>

      {isFolder && (
        <FileTree files={file.children!} rightAction={rightAction} selectedFiles={selectedFiles} onClick={onClick} />
      )}
    </li>
  );
}
