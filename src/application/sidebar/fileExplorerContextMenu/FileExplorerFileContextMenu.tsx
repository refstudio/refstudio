import { Item, Menu } from 'react-contexify';

import { emitEvent } from '../../../events';

export const FILE_EXPLORER_FILE_MENU_ID = 'FileExplorerFileContextMenu';

export function FileExplorerFileContextMenu() {
  return (
    <Menu id={FILE_EXPLORER_FILE_MENU_ID}>
      <Item
        onClick={({ props: { id: untypedId } }) => {
          const id = untypedId as string;
          emitEvent('refstudio://explorer/delete', { path: id });
        }}
      >
        Delete
      </Item>
    </Menu>
  );
}
