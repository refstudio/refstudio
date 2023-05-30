import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';
import { VscFile, VscFolder } from 'react-icons/vsc';

import { PanelSection } from '../Components/PanelSection';
import { cx } from '../cx';
import { FilesAction, FilesState } from '../filesReducer';
import { readAllProjectFiles } from '../filesystem';

export function FoldersView({
  files,
  filesDispatch,
}: {
  files: FilesState;
  filesDispatch: React.Dispatch<FilesAction>;
}) {
  const [allFiles, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    (async function refreshProjectTree() {
      const newFiles = await readAllProjectFiles();
      setFiles(newFiles);
    })();
  }, [setFiles]);

  function handleOnClick(file: FileEntry): void {
    filesDispatch({ type: 'OPEN_FILE', payload: { file, pane: file.path.endsWith('.pdf') ? 'RIGHT' : 'LEFT' } });
  }

  const leftPane = files.openFiles.filter((entry) => entry.pane === 'LEFT');
  const rightPane = files.openFiles.filter((entry) => entry.pane === 'RIGHT');
  const someRight = rightPane.length > 0;

  return (
    <>
      <PanelSection title="Open Files">
        {someRight && <div className="ml-4 text-xs font-bold">LEFT</div>}
        {leftPane.length > 0 && (
          <FileTree
            files={leftPane.map((entry) => entry.file)}
            root
            selectedFiles={leftPane.filter((entry) => entry.active).map((e) => e.file)}
            onClick={handleOnClick}
          />
        )}
        {someRight && <div className="ml-4 text-xs font-bold">RIGHT</div>}
        {rightPane.length > 0 && (
          <FileTree
            files={rightPane.map((entry) => entry.file)}
            root
            selectedFiles={rightPane.filter((entry) => entry.active).map((e) => e.file)}
            onClick={handleOnClick}
          />
        )}
      </PanelSection>
      <PanelSection title="Project X">
        <FileTree
          files={allFiles}
          root
          selectedFiles={files.openFiles.filter((e) => e.active).map((e) => e.file)}
          onClick={handleOnClick}
        />
      </PanelSection>
    </>
  );
}

interface FileTreeBaseProps {
  root?: boolean;
  files: FileEntry[];
  file?: FileEntry;
  selectedFiles: FileEntry[];
  onClick: (file: FileEntry) => void;
}

const FileTree = ({ files, root, ...props }: FileTreeBaseProps) => (
  <div className="overflow-scroll">
    <ul
      className={cx('', {
        'ml-4': root,
        'ml-6': !root,
      })}
    >
      {files.map((file) => (
        <FileTreeNode file={file} files={files} key={file.path} {...props} />
      ))}
    </ul>
  </div>
);

const FileTreeNode = ({ file, onClick, selectedFiles }: FileTreeBaseProps) => {
  if (!file) {
    return null;
  }
  const isFolder = Array.isArray(file.children);

  // Hide DOT_FILES
  if (file.name?.startsWith('.')) {
    return null;
  }

  return (
    <li>
      <div
        className={cx(
          'mb-1 py-1',
          'flex flex-row items-center gap-1', //
          {
            'bg-slate-100': selectedFiles.some((f) => f.path === file.path),
            'cursor-pointer hover:bg-slate-100': !isFolder,
          },
        )}
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
      </div>

      {isFolder && Array.isArray(file.children) && (
        <FileTree files={file.children} selectedFiles={selectedFiles} onClick={onClick} />
      )}
    </li>
  );
};
