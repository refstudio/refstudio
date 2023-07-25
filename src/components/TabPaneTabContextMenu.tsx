import { Item, ItemParams, Menu, Separator } from 'react-contexify';
import { VscClose, VscCloseAll, VscLayoutSidebarLeft, VscLayoutSidebarRight } from 'react-icons/vsc';

import { EditorId } from '../atoms/types/EditorData';
import { PaneId } from '../atoms/types/PaneGroup';
import { emitEvent } from '../events';

export const TABPANE_TAB_MENU_ID = 'TabPaneContextMenu';

export interface TabPaneTabContextMenuProps {
  editorId: EditorId;
  paneId: PaneId;
}

export function TabPaneTabContextMenu() {
  const moveEditorToPane = (props: TabPaneTabContextMenuProps | undefined, toPaneId: PaneId) => {
    const { editorId, paneId } = props ?? {};
    if (!editorId || !paneId || paneId === toPaneId) {
      return;
    }
    emitEvent('refstudio://editors/move', { fromPaneEditorId: { editorId, paneId }, toPaneId });
  };

  return (
    <Menu animation={false} id={TABPANE_TAB_MENU_ID}>
      <Item
        disabled={(params) => params.props.paneId === 'LEFT'}
        onClick={(params: ItemParams<TabPaneTabContextMenuProps>) => {
          moveEditorToPane(params.props, 'LEFT');
        }}
      >
        <div className="flex items-center gap-1">
          <VscLayoutSidebarLeft />
          Move Left
        </div>
      </Item>

      <Item
        disabled={(params) => params.props.paneId === 'RIGHT'}
        onClick={(params: ItemParams<TabPaneTabContextMenuProps>) => {
          moveEditorToPane(params.props, 'RIGHT');
        }}
      >
        <div className="flex items-center gap-1">
          <VscLayoutSidebarRight />
          Move Right
        </div>
      </Item>

      <Item
        onClick={(params: ItemParams<TabPaneTabContextMenuProps>) => {
          const { editorId, paneId } = params.props ?? {};
          if (editorId && paneId) {
            emitEvent('refstudio://editors/close', { editorId, paneId });
          }
        }}
      >
        <div className="flex items-center gap-1">
          <VscClose />
          Close Editor
        </div>
      </Item>
      <Separator />

      <Item onClick={() => emitEvent('refstudio://menu/file/close/all')}>
        <div className="flex items-center gap-1">
          <VscCloseAll />
          Close All
        </div>
      </Item>
    </Menu>
  );
}
