import { Flex, theme, useBoolean } from '@chakra-ui/react';
import { VscChevronDown, VscChevronRight, VscFile } from 'react-icons/vsc';

import { FileId } from '../atoms/types/FileData';
import { FileEntry, FolderFileEntry } from '../atoms/types/FileEntry';
import { FileNode } from './FileNode';

interface FileEntryTreePropsBase {
  files: FileEntry[];
  onFileClick: (fileId: FileId) => void;
  selectedFiles: FileId[];
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
  const { files, onFileClick, paddingLeft, root, selectedFiles } = props;
  const [collapsed, { toggle }] = useBoolean(false);

  return (
    <Flex direction="column" width="100%">
      {!root && (
        <FileNode
          VscIcon={collapsed ? VscChevronRight : VscChevronDown}
          bold
          fileName={props.folderName}
          paddingLeft={`calc(${paddingLeft} - ${theme.space[4]})`}
          onClick={toggle}
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
                paddingLeft={`calc(${paddingLeft} + ${theme.space[4]})`}
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
    </Flex>
  );
}
