import { FileEntry } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';
import { VscFile, VscFolder } from 'react-icons/vsc';

import { PanelSection } from '../Components/PanelSection';
import { cx } from '../cx';
import { readAllProjectFiles } from '../filesystem';

export function FoldersView({
  activeFile,
  openFiles,
  onClick,
}: {
  activeFile?: FileEntry;
  openFiles: FileEntry[];
  onClick?: (fileEntry: FileEntry) => void;
}) {
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    (async function refreshProjectTree() {
      const newFiles = await readAllProjectFiles();
      setFiles(newFiles);
    })();
  }, [setFiles, onClick]);

  function handleOnClick(file: FileEntry): void {
    onClick?.(file);
  }

  return (
    <>
      <PanelSection title="Open Files">
        {activeFile && <FileTree files={openFiles} root selectedFile={activeFile} onClick={handleOnClick} />}
      </PanelSection>
      <PanelSection title="Project X">
        <FileTree files={files} root selectedFile={activeFile} onClick={handleOnClick} />
      </PanelSection>
    </>
  );
}

interface FileTreeBaseProps {
  root?: boolean;
  files: FileEntry[];
  file?: FileEntry;
  selectedFile?: FileEntry;
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

const FileTreeNode = ({ file, onClick, selectedFile }: FileTreeBaseProps) => {
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
            'bg-slate-100': file.path === selectedFile?.path,
            'cursor-pointer hover:bg-slate-100': !isFolder,
          },
        )}
        title={selectedFile?.name}
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
        <FileTree files={file.children} selectedFile={selectedFile} onClick={onClick} />
      )}
    </li>
  );
};
