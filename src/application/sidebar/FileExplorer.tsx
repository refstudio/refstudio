import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { VscChevronDown, VscChevronRight, VscFile } from 'react-icons/vsc';

import { fileExplorerEntryPathBeingRenamed } from '../../atoms/fileExplorerActions';
import { FileExplorerFolderEntry } from '../../atoms/types/FileExplorerEntry';
import { FileNode } from '../../components/FileNode';
import { emitEvent } from '../../events';
import { FILE_EXPLORER_FILE_MENU_ID } from './fileExplorerContextMenu/FileExplorerFileContextMenu';

interface FileExplorerProps {
  fileExplorerEntry: FileExplorerFolderEntry;
  filePathBeingRenamed?: string | null;
  onFileClick: (filePath: string) => void;
  selectedFiles: string[];
  paddingLeft?: string;
}

export function FileExplorer(props: FileExplorerProps) {
  const { fileExplorerEntry, filePathBeingRenamed, onFileClick, selectedFiles, paddingLeft = '0' } = props;
  const files = useAtomValue(fileExplorerEntry.childrenAtom);

  const setPathBeingRenamed = useSetAtom(fileExplorerEntryPathBeingRenamed);

  const [collapsed, setCollapsed] = useAtom(fileExplorerEntry.collapsedAtom);

  const isNameValid = useCallback((name: string) => {
    if (name.startsWith('.')) {
      return false;
    }
    if (name.includes('/')) {
      return false;
    }

    return !files.find(file => file.name === name);
  }, [files]);

  const { root } = fileExplorerEntry;
  return (
    <div className="flex w-full flex-col">
      {!root && (
        <FileNode
          VscIcon={collapsed ? VscChevronRight : VscChevronDown}
          bold
          fileId={fileExplorerEntry.path}
          fileName={fileExplorerEntry.name}
          paddingLeft={`calc(${paddingLeft} - 1rem)`}
          onClick={() => setCollapsed(!collapsed)}
        />
      )}
      {(root || !collapsed) && (
        <>
          {files.map((fileEntry) =>
            fileEntry.isFolder ? (
              <FileExplorer
                {...props}
                fileExplorerEntry={fileEntry}
                key={fileEntry.path}
                paddingLeft={`calc(${paddingLeft} + 1rem)`}
              />
            ) : (
              <FileNode
                VscIcon={VscFile}
                contextMenuId={FILE_EXPLORER_FILE_MENU_ID}
                fileId={fileEntry.path}
                fileName={fileEntry.name}
                isEditMode={filePathBeingRenamed === fileEntry.path}
                isNameValid={isNameValid}
                key={fileEntry.path}
                paddingLeft={paddingLeft}
                selected={selectedFiles.includes(fileEntry.path)}
                onCancelRename={() => setPathBeingRenamed(null)}
                onClick={() => onFileClick(fileEntry.path)}
                onFileRename={(newName: string) =>
                  emitEvent('refstudio://explorer/rename', { path: fileEntry.path, newName })
                }
              />
            ),
          )}
        </>
      )}
    </div>
  );
}
