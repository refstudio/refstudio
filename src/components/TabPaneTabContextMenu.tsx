import { Item, ItemParams, Menu, PredicateParams, Separator } from 'react-contexify';
import { VscClose, VscCloseAll, VscLayoutSidebarLeft, VscLayoutSidebarRight } from 'react-icons/vsc';

import { useOpenEditorsDataForPane } from '../atoms/hooks/useOpenEditorsDataForPane';
import { EditorId } from '../atoms/types/EditorData';
import { PaneId } from '../atoms/types/PaneGroup';
import { emitEvent } from '../events';

export const TABPANE_TAB_MENU_ID = 'TabPaneContextMenu';

export interface TabPaneTabContextMenuProps {
  editorId: EditorId;
  paneId: PaneId;
}

export function TabPaneTabContextMenu() {
  const leftOpenEditorsData = useOpenEditorsDataForPane('LEFT');

  const canMoveEditorToPane = (targetPane: PaneId) => (params: PredicateParams<TabPaneTabContextMenuProps>) => {
    const isInLeft = leftOpenEditorsData.some((e) => e.id === params.props?.editorId);
    if ((isInLeft && targetPane === 'RIGHT') || (!isInLeft && targetPane === 'LEFT')) {
      return false;
    }
    return true;
  };

  const moveEditorToPane = (props: TabPaneTabContextMenuProps | undefined, toPaneId: PaneId) => {
    const { editorId, paneId } = props ?? {};
    if (!editorId || !paneId || paneId === toPaneId) {
      return;
    }
    emitEvent('refstudio://editors/move', { editor: { editorId, paneId }, toPaneId });
  };

  return (
    <Menu animation={false} id={TABPANE_TAB_MENU_ID}>
      <Item
        disabled={canMoveEditorToPane('LEFT')}
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
        disabled={canMoveEditorToPane('RIGHT')}
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
          const editorId = params.props?.editorId;
          if (editorId) {
            const isInLeft = leftOpenEditorsData.some((e) => e.id === params.props?.editorId);
            emitEvent('refstudio://editors/close', { editorId, paneId: isInLeft ? 'LEFT' : 'RIGHT' });
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
