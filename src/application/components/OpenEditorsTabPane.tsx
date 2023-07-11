import { useSetAtom } from 'jotai';

import { selectEditorInPaneAtom } from '../../atoms/editorActions';
import { usePaneActiveEditorId } from '../../atoms/hooks/usePaneActiveEditorId';
import { usePaneOpenEditorsData } from '../../atoms/hooks/usePaneOpenEditorsData';
import { PaneId } from '../../atoms/types/PaneGroup';
import { TabPane } from '../../components/TabPane';
import { emitEvent } from '../../events';

interface OpenEditorsTabPaneProps {
  paneId: PaneId;
}

export function OpenEditorsTabPane({ paneId }: OpenEditorsTabPaneProps) {
  const openEditorsData = usePaneOpenEditorsData(paneId);
  const activeEditorId = usePaneActiveEditorId(paneId);

  const selectFileInPane = useSetAtom(selectEditorInPaneAtom);

  const items = openEditorsData.map((editorData) => ({
    text: editorData.title,
    value: editorData.id,
    isDirty: editorData.isDirty,
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
