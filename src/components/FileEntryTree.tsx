import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { VscChevronDown, VscChevronRight, VscFile } from 'react-icons/vsc';

import { FileExplorerEntry, FileExplorerFileEntry, FileExplorerFolderEntry } from '../atoms/types/FileExplorerEntry';
import { FileNode } from './FileNode';

interface FileEntryTreeProps {
  fileExplorerEntry: FileExplorerFolderEntry;
  onFileClick: (filePath: string) => void;
  selectedFiles: string[];
  paddingLeft?: string;
}

export function FileEntryTree(props: FileEntryTreeProps) {
  const { fileExplorerEntry, onFileClick, selectedFiles, paddingLeft = '0' } = props;
  const files = useAtomValue(fileExplorerEntry.childrenAtom);

  const [collapsed, toggleCollapsed] = useAtom(fileExplorerEntry.collapsedAtom);

  const folderEntries = useMemo(
    () =>
      files
        .filter((file): file is FileExplorerFolderEntry => file.isFolder)
        .sort(alphabeticallySortFileExplorerEntries),
    [files],
  );

  const fileEntries = useMemo(
    () =>
      files.filter((file): file is FileExplorerFileEntry => !file.isFolder).sort(alphabeticallySortFileExplorerEntries),
    [files],
  );

  const { root } = fileExplorerEntry;

  return (
    <div className="flex w-full flex-col">
      {!root && (
        <FileNode
          VscIcon={collapsed ? VscChevronRight : VscChevronDown}
          bold
          fileName={fileExplorerEntry.name}
          paddingLeft={`calc(${paddingLeft} - 1rem)`}
          onClick={toggleCollapsed}
        />
      )}
      {(root || !collapsed) && (
        <>
          {folderEntries.map((folder) => (
            <FileEntryTree
              {...props}
              fileExplorerEntry={folder}
              key={folder.path}
              paddingLeft={`calc(${paddingLeft} + 1rem)`}
            />
          ))}
          {fileEntries.map((file) => (
            <FileNode
              VscIcon={VscFile}
              fileName={file.name}
              key={file.path}
              paddingLeft={paddingLeft}
              selected={selectedFiles.includes(file.path)}
              onClick={() => onFileClick(file.path)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function alphabeticallySortFileExplorerEntries(fileA: FileExplorerEntry, fileB: FileExplorerEntry) {
  const fileNameA = fileA.name.toLowerCase();
  const fileNameB = fileB.name.toLowerCase();

  return fileNameA < fileNameB ? -1 : fileNameA > fileNameB ? 1 : 0;
}
