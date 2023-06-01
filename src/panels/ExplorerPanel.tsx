import { FileEntry } from '@tauri-apps/api/fs';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { VscFile, VscFolder } from 'react-icons/vsc';

import { leftPaneAtom, openFileAction, openFilesAtom, rightPaneAtom } from '../atoms/openFilesState';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { cx } from '../cx';
import { readAllProjectFiles } from '../filesystem';

export function ExplorerPanel() {
  const [openFiles, setOpenFiles] = useAtom(openFilesAtom);
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);

  const [allFiles, setFiles] = useState<FileEntry[]>([]);
  useEffect(() => {
    (async function refreshProjectTree() {
      const newFiles = await readAllProjectFiles();
      setFiles(newFiles);
    })();
  }, [setFiles]);

  function handleOnClick(file: FileEntry): void {
    const paneId = file.path.endsWith('.pdf') ? 'RIGHT' : 'LEFT';
    setOpenFiles(openFileAction(openFiles, paneId, file));
  }

  return (
    <PanelWrapper title="Explorer">
      <PanelSection title="Open Files">
        {right.files.length > 0 && <div className="ml-4 text-xs font-bold">LEFT</div>}
        {left.files.length > 0 && (
          <FileTree files={left.files} root selectedFiles={left.active ? [left.active] : []} onClick={handleOnClick} />
        )}
        {right.files.length > 0 && <div className="ml-4 text-xs font-bold">RIGHT</div>}
        {right.files.length > 0 && (
          <FileTree
            files={right.files}
            root
            selectedFiles={right.active ? [right.active] : []}
            onClick={handleOnClick}
          />
        )}
      </PanelSection>
      <PanelSection title="Project X">
        <FileTree
          files={allFiles}
          root
          selectedFiles={[left.active, right.active].filter((file) => file).map((file) => file!)}
          onClick={handleOnClick}
        />
      </PanelSection>
    </PanelWrapper>
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
