import { useAtom, useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { VscChevronDown, VscChevronRight, VscFile } from 'react-icons/vsc';

import { EditorId } from '../atoms/types/EditorData';
import { FileExplorerEntry, FileExplorerFileEntry, FileExplorerFolderEntry } from '../atoms/types/FileExplorerEntry';
import { FileNode } from './FileNode';

interface FileEntryNodeProps {
  fileExplorerEntry: FileExplorerFolderEntry;
  onFileClick: (editorId: EditorId) => void;
  selectedFiles: string[];
  paddingLeft?: string;
}

export function FileEntryNode(props: FileEntryNodeProps) {
  const { fileExplorerEntry, onFileClick, selectedFiles, paddingLeft = '0' } = props;
  const files = useAtomValue(fileExplorerEntry.children);

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
      files
        .filter((file): file is FileExplorerFileEntry => !file.isFolder)
        .sort(alphabeticallySortFileExplorerEntries),
    [files],
  );

  const { root } = fileExplorerEntry;

  return <div className="flex w-full flex-col">
    {!root && <FileNode
      VscIcon={collapsed ? VscChevronRight : VscChevronDown}
      bold
      fileName={fileExplorerEntry.name}
      paddingLeft={`calc(${paddingLeft} - 1rem)`}
      onClick={toggleCollapsed}
    />}
    {(root || !collapsed) && <>
      {folderEntries.map((folder) => (
        <FileEntryNode
          {...props}
          fileExplorerEntry={folder}
          key={folder.name}
          paddingLeft={`calc(${paddingLeft} + 1rem)`}
        />
      ))}
      {fileEntries.map((file) => (
        <FileNode
          VscIcon={VscFile}
          fileName={file.name}
          key={file.editorId}
          paddingLeft={paddingLeft}
          selected={selectedFiles.includes(file.editorId)}
          onClick={() => onFileClick(file.editorId)}
        />
      ))}
    </>}
  </div>;
}

function alphabeticallySortFileExplorerEntries(fileA: FileExplorerEntry, fileB: FileExplorerEntry) {
  const fileNameA = fileA.name.toLowerCase();
  const fileNameB = fileB.name.toLowerCase();

  return (fileNameA < fileNameB) ? -1 : (fileNameA > fileNameB) ? 1 : 0;
}