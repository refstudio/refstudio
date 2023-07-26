import { Item, ItemParams, Menu } from 'react-contexify';

import { emitEvent } from '../../../events';

export const FILE_EXPLORER_FILE_MENU_ID = 'FileExplorerFileContextMenu';

export function FileExplorerFileContextMenu() {
  return (
    <Menu animation={false} id={FILE_EXPLORER_FILE_MENU_ID}>
      <Item
        onClick={(params: ItemParams<{ id: string }>) => {
          const id = params.props?.id;
          if (id) {
            emitEvent('refstudio://explorer/rename', { path: id });
          }
        }}
      >
        Rename...
      </Item>
      <Item
        onClick={(params: ItemParams<{ id: string }>) => {
          const id = params.props?.id;
          if (id) {
            emitEvent('refstudio://explorer/delete', { path: id });
          }
        }}
      >
        Delete File
      </Item>
    </Menu>
  );
}
