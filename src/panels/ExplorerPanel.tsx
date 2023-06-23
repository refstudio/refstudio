import { Box } from '@chakra-ui/layout';
import { theme } from '@chakra-ui/theme';
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
import { FileEntryTree } from '../components/FileEntryTree';
import { FilesList } from '../components/FilesList';
import { PanelSection } from '../components/PanelSection';
import { PanelWrapper } from '../components/PanelWrapper';
import { readAllProjectFiles } from '../filesystem';
import { isNonNullish } from '../lib/isNonNullish';

export function ExplorerPanel() {
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);
  const selectFileInPane = useSetAtom(selectFileInPaneAtom);
  const openFile = useSetAtom(openFileAtom);
  const closeAllFiles = useSetAtom(closeAllFilesAtom);
  const splitFileToPane = useSetAtom(splitFileToPaneAtom);

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

  const handleSplitFile = useCallback(
    ({ fileId, fromPaneId, toPaneId }: { fileId: FileId; fromPaneId: PaneId; toPaneId: PaneId }) =>
      (evt: React.MouseEvent) => {
        evt.stopPropagation();
        splitFileToPane({ fileId, fromPaneId, toPaneId });
      },
    [splitFileToPane],
  );

  const hasLeftAndRightPanelsFiles = left.files.length > 0 && right.files.length > 0;

  return (
    <PanelWrapper title="Explorer">
      <PanelSection
        rightIcons={[{ key: 'closeAll', Icon: VscCloseAll, title: 'Close All Open Files', onClick: closeAllFiles }]}
        title="Open Files"
      >
        {hasLeftAndRightPanelsFiles && (
          <Box fontSize={theme.fontSizes.xs} fontWeight={theme.fontWeights.bold} marginLeft={theme.space[4]}>
            LEFT
          </Box>
        )}
        {left.files.length > 0 && (
          <FilesList
            files={left.files}
            paddingLeft={theme.space[6]}
            rightAction={(fileId) => ({
              onClick: handleSplitFile({ fileId, fromPaneId: left.id, toPaneId: right.id }),
              VscIcon: VscSplitHorizontal,
              title: `Move to ${right.id} split pane`,
            })}
            selectedFiles={left.activeFile ? [left.activeFile] : []}
            onClick={(fileId) => selectFileInPane({ paneId: left.id, fileId })}
          />
        )}
        {hasLeftAndRightPanelsFiles && (
          <Box fontSize={theme.fontSizes.xs} fontWeight={theme.fontWeights.bold} marginLeft={theme.space[4]}>
            RIGHT
          </Box>
        )}
        {right.files.length > 0 && (
          <FilesList
            files={right.files}
            paddingLeft={theme.space[6]}
            rightAction={(fileId) => ({
              onClick: handleSplitFile({ fileId, fromPaneId: right.id, toPaneId: left.id }),
              VscIcon: VscSplitHorizontal,
              title: `Move to ${right.id} split pane`,
            })}
            selectedFiles={right.activeFile ? [right.activeFile] : []}
            onClick={(fileId) => selectFileInPane({ paneId: right.id, fileId })}
          />
        )}
      </PanelSection>
      <PanelSection grow title="Project X">
        <FileEntryTree
          files={allFiles}
          paddingLeft={theme.space[5]}
          root
          selectedFiles={[left.activeFile, right.activeFile].filter(isNonNullish)}
          onFileClick={handleOpenFile}
        />
      </PanelSection>
    </PanelWrapper>
  );
}
