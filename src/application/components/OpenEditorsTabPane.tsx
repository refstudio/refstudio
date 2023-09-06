import { useSetAtom } from 'jotai';

import { selectEditorInPaneAtom } from '../../atoms/editorActions';
import { useActiveEditorIdForPane } from '../../atoms/hooks/useActiveEditorIdForPane';
import { useOpenEditorsDataForPane } from '../../atoms/hooks/useOpenEditorsDataForPane';
import { EditorContentType } from '../../atoms/types/EditorContent';
import { EditorId, parseEditorId } from '../../atoms/types/EditorData';
import { PaneId } from '../../atoms/types/PaneGroup';
import { TabPane, TabPaneProps } from '../../components/TabPane';
import { TABPANE_TAB_MENU_ID } from '../../components/TabPaneTabContextMenu';
import { emitEvent } from '../../events';
import { PdfEditorIcon, RefStudioEditorIcon } from './icons';

const EDITOR_ICONS: Record<EditorContentType, () => React.ReactElement | undefined> = {
  refstudio: RefStudioEditorIcon,
  pdf: PdfEditorIcon,
  text: () => undefined,
  json: () => undefined,
  references: () => undefined,
  reference: () => undefined,
};

interface OpenEditorsTabPaneProps {
  paneId: PaneId;
}
export function OpenEditorsTabPane({ paneId }: OpenEditorsTabPaneProps) {
  const openEditorsData = useOpenEditorsDataForPane(paneId);
  const activeEditorId = useActiveEditorIdForPane(paneId);

  const selectFileInPane = useSetAtom(selectEditorInPaneAtom);

  const items = openEditorsData.map<TabPaneProps<EditorId>['items'][number]>((editorData) => {
    const { type } = parseEditorId(editorData.id);
    return {
      text: editorData.title,
      value: editorData.id,
      isDirty: editorData.isDirty,
      Icon: EDITOR_ICONS[type](),
      contextMenu: {
        menuId: TABPANE_TAB_MENU_ID,
        ctxProps: {
          editorId: editorData.id,
          paneId,
        },
      },
    };
  });

  return (
    <TabPane
      items={items}
      value={activeEditorId}
      onClick={(editorId) => selectFileInPane({ paneId, editorId })}
      onCloseClick={(editorId) => emitEvent('refstudio://editors/close', { paneId, editorId })}
    />
  );
}
