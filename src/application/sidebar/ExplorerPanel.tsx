import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { VscCloseAll, VscSplitHorizontal } from 'react-icons/vsc';

import { closeAllEditorsAtom, moveEditorToPaneAtom, selectEditorInPaneAtom } from '../../atoms/editorActions';
import { openFilePathAtom } from '../../atoms/fileEntryActions';
import { fileExplorerAtom, refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { usePaneActiveEditorId } from '../../atoms/hooks/usePaneActiveEditorId';
import { usePaneOpenEditorsData } from '../../atoms/hooks/usePaneOpenEditorsData';
import { EditorId, parseEditorId } from '../../atoms/types/EditorData';
import { PaneId } from '../../atoms/types/PaneGroup';
import { EditorsList } from '../../components/EditorsList';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { isNonNullish } from '../../lib/isNonNullish';
import { FileExplorer } from './FileExplorer';

export function ExplorerPanel() {
  const leftPaneOpenEditors = usePaneOpenEditorsData('LEFT');
  const leftPaneActiveEditorId = usePaneActiveEditorId('LEFT');
  const rightPaneOpenEditors = usePaneOpenEditorsData('RIGHT');
  const rightPaneActiveEditorId = usePaneActiveEditorId('RIGHT');
  const rootFileExplorerEntry = useAtomValue(fileExplorerAtom);

  const selectFileInPane = useSetAtom(selectEditorInPaneAtom);
  const openFile = useSetAtom(openFilePathAtom);
  const closeAllFiles = useSetAtom(closeAllEditorsAtom);
  const moveEditorToPane = useSetAtom(moveEditorToPaneAtom);
  const refreshFileTree = useSetAtom(refreshFileTreeAtom);

  useAsyncEffect(refreshFileTree);

  const handleMoveEditor = useCallback(
    ({ editorId, fromPaneId, toPaneId }: { editorId: EditorId; fromPaneId: PaneId; toPaneId: PaneId }) =>
      (evt: React.MouseEvent) => {
        evt.stopPropagation();
        moveEditorToPane({ editorId, fromPaneId, toPaneId });
      },
    [moveEditorToPane],
  );

  const hasLeftAndRightPanelsFiles = leftPaneOpenEditors.length > 0 && rightPaneOpenEditors.length > 0;

  return (
    <PanelWrapper title="Explorer">
      <PanelSection
        rightIcons={[{ key: 'closeAll', Icon: VscCloseAll, title: 'Close All Open Files', onClick: closeAllFiles }]}
        title="Open Files"
      >
        {hasLeftAndRightPanelsFiles && <div className="ml-4 text-xs font-bold">LEFT</div>}
        {leftPaneOpenEditors.length > 0 && (
          <EditorsList
            editors={leftPaneOpenEditors}
            paddingLeft="1.5rem"
            rightAction={(editorId) => ({
              onClick: handleMoveEditor({ editorId, fromPaneId: 'LEFT', toPaneId: 'RIGHT' }),
              VscIcon: VscSplitHorizontal,
              title: 'Move to RIGHT split pane',
            })}
            selectedEditors={leftPaneActiveEditorId ? [leftPaneActiveEditorId] : []}
            onClick={(editorId) => selectFileInPane({ paneId: 'LEFT', editorId })}
          />
        )}
        {hasLeftAndRightPanelsFiles && <div className="ml-4 text-xs font-bold">RIGHT</div>}
        {rightPaneOpenEditors.length > 0 && (
          <EditorsList
            editors={rightPaneOpenEditors}
            paddingLeft="1.5rem"
            rightAction={(editorId) => ({
              onClick: handleMoveEditor({ editorId, fromPaneId: 'RIGHT', toPaneId: 'LEFT' }),
              VscIcon: VscSplitHorizontal,
              title: `Move to RIGHT split pane`,
            })}
            selectedEditors={rightPaneActiveEditorId ? [rightPaneActiveEditorId] : []}
            onClick={(editorId) => selectFileInPane({ paneId: 'RIGHT', editorId })}
          />
        )}
      </PanelSection>
      <PanelSection grow title="Project X">
        <FileExplorer
          fileExplorerEntry={rootFileExplorerEntry}
          paddingLeft="1.25rem"
          selectedFiles={[leftPaneActiveEditorId, rightPaneActiveEditorId]
            .filter(isNonNullish)
            .map((editorId) => parseEditorId(editorId).id)}
          onFileClick={openFile}
        />
      </PanelSection>
    </PanelWrapper>
  );
}
