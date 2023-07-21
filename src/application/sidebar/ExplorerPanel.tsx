import { useAtomValue, useSetAtom } from 'jotai';

import { openFilePathAtom } from '../../atoms/fileEntryActions';
import { fileExplorerAtom, refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { useActiveEditorIdForPane } from '../../atoms/hooks/useActiveEditorIdForPane';
import { parseEditorId } from '../../atoms/types/EditorData';
import { PanelSection } from '../../components/PanelSection';
import { PanelWrapper } from '../../components/PanelWrapper';
import { useAsyncEffect } from '../../hooks/useAsyncEffect';
import { isNonNullish } from '../../lib/isNonNullish';
import { FileExplorer } from './FileExplorer';

export function ExplorerPanel() {
  const leftPaneActiveEditorId = useActiveEditorIdForPane('LEFT');
  const rightPaneActiveEditorId = useActiveEditorIdForPane('RIGHT');
  const rootFileExplorerEntry = useAtomValue(fileExplorerAtom);
  const openFile = useSetAtom(openFilePathAtom);
  const refreshFileTree = useSetAtom(refreshFileTreeAtom);

  useAsyncEffect(refreshFileTree);

  return (
    <PanelWrapper title="Explorer">
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
