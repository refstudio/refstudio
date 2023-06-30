import { useState } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);

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
          {files
            .filter((file) => !file.isDotfile)
            .filter((file): file is FolderFileEntry => file.isFolder)
            .map((folder) => (
              <FileEntryTree
                {...props}
                files={folder.children}
                folderName={folder.name}
                key={folder.path}
                paddingLeft={`calc(${paddingLeft} + 1rem)`}
                root={false}
              />
            ))}
          {files
            .filter((file) => !file.isDotfile)
            .filter((file) => file.isFile)
            .map((file) => (
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
