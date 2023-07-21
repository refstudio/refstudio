import { useSetAtom } from 'jotai';
import { Item, Menu } from 'react-contexify';
import { VscClose, VscCloseAll, VscLayout, VscLayoutSidebarLeft, VscLayoutSidebarRight } from 'react-icons/vsc';

import { closeAllEditorsAtom, closeEditorFromAllPanesAtom, moveEditorToPaneAtom } from '../atoms/editorActions';
import { useOpenEditorsDataForPane } from '../atoms/hooks/useOpenEditorsDataForPane';
import { EditorId } from '../atoms/types/EditorData';
import { PaneId } from '../atoms/types/PaneGroup';

export const TABPANE_TAB_MENU_ID = 'TabPaneContextMenu';

export interface TabPaneTabContextMenuProps {
  editorId: EditorId;
  fromPaneId: PaneId;
  toPaneId: PaneId;
}

export function TabPaneTabContextMenu() {
  const closeAllEditors = useSetAtom(closeAllEditorsAtom);
  const closeEditor = useSetAtom(closeEditorFromAllPanesAtom);
  const moveEditorToPane = useSetAtom(moveEditorToPaneAtom);
  const leftOpenEditorsData = useOpenEditorsDataForPane('LEFT');

  return (
    <Menu animation={false} id={TABPANE_TAB_MENU_ID}>
      <Item
        onClick={({ props: { editorId: untypedEditorId } }) => {
          const editorId = untypedEditorId as EditorId;

          const fromPaneId: PaneId = leftOpenEditorsData.find((e) => e.id === editorId) ? 'LEFT' : 'RIGHT';

          const toPaneId: PaneId = fromPaneId === 'LEFT' ? 'RIGHT' : 'LEFT';

          console.log(editorId, fromPaneId, toPaneId);
          moveEditorToPane({ editorId, fromPaneId, toPaneId });
        }}
      >
        <div className="flex items-center gap-1">
          <VscLayout /> Toggle Pane
        </div>
      </Item>
      <Item
        onClick={({ props: { editorId: untypedEditorId } }) => {
          moveEditorToPane({ editorId: untypedEditorId as EditorId, fromPaneId: 'RIGHT', toPaneId: 'LEFT' });
        }}
      >
        <div className="flex items-center gap-1">
          <VscLayoutSidebarLeft /> Move Left
        </div>
      </Item>
      <Item
        onClick={({ props: { editorId: untypedEditorId } }) => {
          moveEditorToPane({ editorId: untypedEditorId as EditorId, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
        }}
      >
        <div className="flex items-center gap-1">
          <VscLayoutSidebarRight /> Move Right
        </div>
      </Item>
      <Item
        onClick={({ props: { editorId: untypedEditorId } }) => {
          closeEditor(untypedEditorId as EditorId);
        }}
      >
        <div className="flex items-center gap-1">
          <VscClose /> Close Editor
        </div>
      </Item>
      <Item onClick={closeAllEditors}>
        <div className="flex items-center gap-1">
          <VscCloseAll /> Close All
        </div>
      </Item>
    </Menu>
  );
}
