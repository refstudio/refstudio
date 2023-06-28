import { useQuery } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { VscCloseAll, VscSplitHorizontal } from 'react-icons/vsc';

import {
  closeAllEditorsAtom,
  moveEditorToPaneAtom,
  openFileEntryAtom,
  selectEditorInPaneAtom,
} from '../../atoms/editorActions';
import { leftPaneAtom, rightPaneAtom } from '../../atoms/paneActions';
import { EditorId, parseEditorId } from '../../atoms/types/EditorData';
import { FileEntry, FileFileEntry } from '../../atoms/types/FileEntry';
import { PaneId } from '../../atoms/types/PaneGroup';
import { EditorsList } from '../../components/EditorsList';
import { FileEntryTree } from '../../components/FileEntryTree';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { readAllProjectFiles } from '../../io/filesystem';
import { isNonNullish } from '../../lib/isNonNullish';

export function ExplorerPanel() {
  const left = useAtomValue(leftPaneAtom);
  const right = useAtomValue(rightPaneAtom);
  const selectFileInPane = useSetAtom(selectEditorInPaneAtom);
  const openFile = useSetAtom(openFileEntryAtom);
  const closeAllFiles = useSetAtom(closeAllEditorsAtom);
  const moveEditorToPane = useSetAtom(moveEditorToPaneAtom);

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
    (filePath: string) => {
      const file = flattenedFiles.find((f) => f.path === filePath);
      if (!file) {
        console.warn('This file does not exist');
        return;
      }
      openFile(file);
    },
    [flattenedFiles, openFile],
  );

  const handleMoveEditor = useCallback(
    ({ editorId, fromPaneId, toPaneId }: { editorId: EditorId; fromPaneId: PaneId; toPaneId: PaneId }) =>
      (evt: React.MouseEvent) => {
        evt.stopPropagation();
        moveEditorToPane({ editorId, fromPaneId, toPaneId });
      },
    [moveEditorToPane],
  );

  const hasLeftAndRightPanelsFiles = left.openEditors.length > 0 && right.openEditors.length > 0;

  return (
    <PanelWrapper title="Explorer">
      <PanelSection
        rightIcons={[{ key: 'closeAll', Icon: VscCloseAll, title: 'Close All Open Files', onClick: closeAllFiles }]}
        title="Open Files"
      >
        {hasLeftAndRightPanelsFiles && <div className="ml-4 text-xs font-bold">LEFT</div>}
        {left.openEditors.length > 0 && (
          <EditorsList
            editors={left.openEditors}
            paddingLeft="1.5rem"
            rightAction={(editorId) => ({
              onClick: handleMoveEditor({ editorId, fromPaneId: left.id, toPaneId: right.id }),
              VscIcon: VscSplitHorizontal,
              title: `Move to ${right.id} split pane`,
            })}
            selectedEditors={left.activeEditor ? [left.activeEditor.id] : []}
            onClick={(editorId) => selectFileInPane({ paneId: left.id, editorId })}
          />
        )}
        {hasLeftAndRightPanelsFiles && <div className="ml-4 text-xs font-bold">RIGHT</div>}
        {right.openEditors.length > 0 && (
          <EditorsList
            editors={right.openEditors}
            paddingLeft="1.5rem"
            rightAction={(editorId) => ({
              onClick: handleMoveEditor({ editorId, fromPaneId: right.id, toPaneId: left.id }),
              VscIcon: VscSplitHorizontal,
              title: `Move to ${right.id} split pane`,
            })}
            selectedEditors={right.activeEditor ? [right.activeEditor.id] : []}
            onClick={(editorId) => selectFileInPane({ paneId: right.id, editorId })}
          />
        )}
      </PanelSection>
      <PanelSection grow title="Project X">
        <FileEntryTree
          files={allFiles}
          paddingLeft="1.25rem"
          root
          selectedFiles={
            [left.activeEditor?.id, right.activeEditor?.id]
              .filter(isNonNullish)
              .map(editorId => parseEditorId(editorId).id)}
          onFileClick={handleOpenFile}
        />
      </PanelSection>
    </PanelWrapper>
  );
}
