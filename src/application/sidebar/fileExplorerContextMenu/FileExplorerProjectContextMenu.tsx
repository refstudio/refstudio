import { Item, Menu, Separator } from 'react-contexify';

import { emitEvent } from '../../../events';

export const FILE_EXPLORER_PROJECT_MENU_ID = 'FileExplorerProjectContextMenu';

export function FileExplorerProjectContextMenu() {
  return (
    <Menu animation={false} id={FILE_EXPLORER_PROJECT_MENU_ID}>
      <Item
        onClick={() => {
          emitEvent('refstudio://menu/file/new');
        }}
      >
        New File
      </Item>
      <Separator />
      <Item
        onClick={() => {
          emitEvent('refstudio://menu/file/project/open');
        }}
      >
        Open Project
      </Item>
      <Item
        onClick={() => {
          emitEvent('refstudio://menu/file/project/close');
        }}
      >
        Close Project
      </Item>
    </Menu>
  );
}
