import { useQuery } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { VscCloseAll, VscSplitHorizontal } from 'react-icons/vsc';

import {
  closeAllFilesAtom,
  leftPaneAtom,
  openFileAtom,
  rightPaneAtom,
  selectFileInPaneAtom,
  splitFileToPaneAtom,
} from '../atoms/fileActions';
import { FileId } from '../atoms/types/FileData';
import { FileEntry, FileFileEntry } from '../atoms/types/FileEntry';
import { PaneId } from '../atoms/types/PaneGroup';
import { FileEntryTree, FileTreeNode } from '../components/FileEntryTree';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { readAllProjectFiles } from '../filesystem';
import { isNonNullish } from '../lib/isNonNullish';

function SplitPaneButton({ fromPaneId, toPaneId, fileId }: { fromPaneId: PaneId; toPaneId: PaneId; fileId: FileId }) {
  const splitFileToPane = useSetAtom(splitFileToPaneAtom);

  return (
    <VscSplitHorizontal
      title={`Move to ${fromPaneId} split pane`}
      onClick={(evt) => {
        evt.stopPropagation();
        splitFileToPane({ fileId, fromPaneId, toPaneId });
      }}
    />
  );
}

export function ExplorerPanel() {
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);
  const selectFileInPane = useSetAtom(selectFileInPaneAtom);
  const openFile = useSetAtom(openFileAtom);
  const closeAllFiles = useSetAtom(closeAllFilesAtom);

  const { data: allFiles } = useQuery({
    queryKey: ['allFiles'],
    queryFn: readAllProjectFiles,
    initialData: [],
  });

  const flattenFiles: (files: FileEntry[]) => FileFileEntry[] = useCallback(
    (files: FileEntry[]) => files.flatMap((file) => (file.isFolder ? flattenFiles(file.children) : file)),
    [],
  );

  const flattenedFiles = useMemo(() => flattenFiles(allFiles), [allFiles, flattenFiles]);

  const handleOpenFile = useCallback(
    (fileId: FileId) => {
      const file = flattenedFiles.find((f) => f.path === fileId);
      if (!file) {
        console.warn('This file does not exist');
        return;
      }
      openFile(file);
    },
    [flattenedFiles, openFile],
  );

  const hasRightPanelFiles = right.files.length > 0;

  return (
    <PanelWrapper title="Explorer">
      <PanelSection
        rightIcons={[{ key: 'closeAll', Icon: VscCloseAll, title: 'Close All Open Files', onClick: closeAllFiles }]}
        title="Open Files"
      >
        {hasRightPanelFiles && <div className="ml-4 text-xs font-bold">LEFT</div>}
        {left.files.length > 0 && (
          <div className="ml-4">
            {left.files.map(({ fileId, fileName }) => (
              <FileTreeNode
                fileName={fileName}
                key={fileId}
                rightAction={<SplitPaneButton fileId={fileId} fromPaneId={left.id} toPaneId={right.id} />}
                selected={fileId === left.activeFile}
                onClick={() => selectFileInPane({ paneId: left.id, fileId })}
              />
            ))}
          </div>
        )}
        {hasRightPanelFiles && <div className="ml-4 text-xs font-bold">RIGHT</div>}
        {hasRightPanelFiles && (
          <div className="ml-4">
            {right.files.map(({ fileId, fileName }) => (
              <FileTreeNode
                fileName={fileName}
                key={fileId}
                rightAction={<SplitPaneButton fileId={fileId} fromPaneId={right.id} toPaneId={left.id} />}
                selected={fileId === left.activeFile}
                onClick={() => selectFileInPane({ paneId: right.id, fileId })}
              />
            ))}
          </div>
        )}
      </PanelSection>
      <PanelSection grow title="Project X">
        <FileEntryTree
          files={allFiles}
          root
          selectedFiles={[left.activeFile, right.activeFile].filter(isNonNullish)}
          onClick={handleOpenFile}
        />
      </PanelSection>
    </PanelWrapper>
  );
}
