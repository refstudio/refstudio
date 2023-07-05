import { useAtom, useAtomValue } from 'jotai';
import { VscChevronDown, VscChevronRight, VscFile } from 'react-icons/vsc';

import { FileExplorerFolderEntry } from '../../atoms/types/FileExplorerEntry';
import { FileNode } from '../../components/FileNode';

interface FileEntryTreeProps {
  fileExplorerEntry: FileExplorerFolderEntry;
  onFileClick: (filePath: string) => void;
  selectedFiles: string[];
  paddingLeft?: string;
}

export function FileEntryTree(props: FileEntryTreeProps) {
  const { fileExplorerEntry, onFileClick, selectedFiles, paddingLeft = '0' } = props;
  const files = useAtomValue(fileExplorerEntry.childrenAtom);

  const [collapsed, setCollapsed] = useAtom(fileExplorerEntry.collapsedAtom);

  const { root } = fileExplorerEntry;

  return (
    <div className="flex w-full flex-col">
      {!root && (
        <FileNode
          VscIcon={collapsed ? VscChevronRight : VscChevronDown}
          bold
          fileName={fileExplorerEntry.name}
          paddingLeft={`calc(${paddingLeft} - 1rem)`}
          onClick={() => setCollapsed(!collapsed)}
        />
      )}
      {(root || !collapsed) && (
        <>
          {files.map((fileEntry) =>
            fileEntry.isFolder ? (
              <FileEntryTree
                {...props}
                fileExplorerEntry={fileEntry}
                key={fileEntry.path}
                paddingLeft={`calc(${paddingLeft} + 1rem)`}
              />
            ) : (
              <FileNode
                VscIcon={VscFile}
                fileName={fileEntry.name}
                key={fileEntry.path}
                paddingLeft={paddingLeft}
                selected={selectedFiles.includes(fileEntry.path)}
                onClick={() => onFileClick(fileEntry.path)}
              />
            ),
          )}
        </>
      )}
    </div>
  );
}
