import { useSetAtom } from 'jotai';
import { Item, ItemParams, Menu, PredicateParams, Separator } from 'react-contexify';
import { VscClose, VscCloseAll, VscLayoutSidebarLeft, VscLayoutSidebarRight } from 'react-icons/vsc';

import { closeAllEditorsAtom, closeEditorFromAllPanesAtom, moveEditorToPaneAtom } from '../atoms/editorActions';
import { useOpenEditorsDataForPane } from '../atoms/hooks/useOpenEditorsDataForPane';
import { EditorId } from '../atoms/types/EditorData';
import { PaneId } from '../atoms/types/PaneGroup';

export const TABPANE_TAB_MENU_ID = 'TabPaneContextMenu';

interface TabPaneTabContextMenuProps {
  editorId: EditorId;
}

export function TabPaneTabContextMenu() {
  const closeAllEditors = useSetAtom(closeAllEditorsAtom);
  const closeEditor = useSetAtom(closeEditorFromAllPanesAtom);
  const moveEditorToPane = useSetAtom(moveEditorToPaneAtom);
  const leftOpenEditorsData = useOpenEditorsDataForPane('LEFT');

  const canMoveEditorToPane = (targetPane: PaneId) => (params: PredicateParams<TabPaneTabContextMenuProps>) => {
    const isInLeft = leftOpenEditorsData.some((e) => e.id === params.props?.editorId);
    if ((isInLeft && targetPane === 'RIGHT') || (!isInLeft && targetPane === 'LEFT')) {
      return false;
    }
    return true;
  };

  return (
    <Menu animation={false} id={TABPANE_TAB_MENU_ID}>
      <Item
        disabled={canMoveEditorToPane('LEFT')}
        onClick={(params: ItemParams<TabPaneTabContextMenuProps>) => {
          const editorId = params.props?.editorId;
          if (editorId) {
            moveEditorToPane({ editorId, fromPaneId: 'RIGHT', toPaneId: 'LEFT' });
          }
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
          const editorId = params.props?.editorId;
          if (editorId) {
            moveEditorToPane({ editorId, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
          }
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
            closeEditor(editorId);
          }
        }}
      >
        <div className="flex items-center gap-1">
          <VscClose />
          Close Editor
        </div>
      </Item>
      <Separator />

      <Item onClick={closeAllEditors}>
        <div className="flex items-center gap-1">
          <VscCloseAll />
          Close All
        </div>
      </Item>
    </Menu>
  );
}
