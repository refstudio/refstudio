import { useSetAtom } from 'jotai';

import { selectEditorInPaneAtom } from '../../atoms/editorActions';
import { useActiveEditorIdForPane } from '../../atoms/hooks/useActiveEditorIdForPane';
import { useOpenEditorsDataForPane } from '../../atoms/hooks/useOpenEditorsDataForPane';
import { PaneId } from '../../atoms/types/PaneGroup';
import { TabPane } from '../../components/TabPane';
import { TabPaneTabContextMenuProps } from '../../components/TabPaneTabContextMenu';
import { emitEvent } from '../../events';

interface OpenEditorsTabPaneProps {
  paneId: PaneId;
}

export function OpenEditorsTabPane({ paneId }: OpenEditorsTabPaneProps) {
  const openEditorsData = useOpenEditorsDataForPane(paneId);
  const activeEditorId = useActiveEditorIdForPane(paneId);

  const selectFileInPane = useSetAtom(selectEditorInPaneAtom);

  const items = openEditorsData.map((editorData) => ({
    text: editorData.title,
    value: editorData.id,
    isDirty: editorData.isDirty,
    ctxProps: {
      editorId: editorData.id,
      paneId,
    } as TabPaneTabContextMenuProps,
  }));

  return (
    <TabPane
      items={items}
      value={activeEditorId}
      onClick={(editorId) => selectFileInPane({ paneId, editorId })}
      onCloseClick={(editorId) => emitEvent('refstudio://editors/close', { paneId, editorId })}
    />
  );
}
