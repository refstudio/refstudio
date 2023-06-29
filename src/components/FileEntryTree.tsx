import { useMemo, useState } from 'react';
import { VscChevronDown, VscChevronRight, VscFile } from 'react-icons/vsc';

import { FileEntry, FolderFileEntry } from '../atoms/types/FileEntry';
import { FileNode } from './FileNode';

interface FileEntryTreePropsBase {
  files: FileEntry[];
  onFileClick: (filePath: string) => void;
  selectedFiles: string[];
  paddingLeft?: string;
}

interface RootFileEntryTreeProps extends FileEntryTreePropsBase {
  root: true;
}

interface NonRootFileEntryTreeProps extends FileEntryTreePropsBase {
  root?: false;
  folderName: string;
}

type FileEntryTreeProps = RootFileEntryTreeProps | NonRootFileEntryTreeProps;

export function FileEntryTree(props: FileEntryTreeProps) {
  const { files, onFileClick, paddingLeft = '0', root, selectedFiles } = props;
  const [collapsed, setCollapsed] = useState(true);

  const folderEntries = useMemo(
    () =>
      files
        .filter((file) => !file.isDotfile)
        .filter((file): file is FolderFileEntry => file.isFolder)
        .sort(alphabeticallySortFileEntries),
    [files],
  );

  const fileEntries = useMemo(
    () =>
      files
        .filter((file) => !file.isDotfile)
        .filter((file) => file.isFile)
        .sort(alphabeticallySortFileEntries),
    [files],
  );

  return (
    <div className="flex w-full flex-col">
      {!root && (
        <FileNode
          VscIcon={collapsed ? VscChevronRight : VscChevronDown}
          bold
          fileName={props.folderName}
          paddingLeft={`calc(${paddingLeft} - 1rem)`}
          onClick={() => setCollapsed((currentState) => !currentState)}
        />
      )}
      {(root || !collapsed) && (
        <>
          {folderEntries.map((folder) => (
            <FileEntryTree
              {...props}
              files={folder.children}
              folderName={folder.name}
              key={folder.path}
              paddingLeft={`calc(${paddingLeft} + 1rem)`}
              root={false}
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

function alphabeticallySortFileEntries(fileA: FileEntry, fileB: FileEntry) {
  const fileNameA = fileA.name.toLowerCase();
  const fileNameB = fileB.name.toLowerCase();

  return (fileNameA < fileNameB) ? -1 : (fileNameA > fileNameB) ? 1 : 0;
}