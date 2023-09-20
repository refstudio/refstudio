import { useCallback } from 'react';
import { Item, Menu, TriggerEvent, useContextMenu } from 'react-contexify';

import { emitEvent } from '../../../events';

export const UPLOAD_MENU_ID = 'upload-context-menu';

export function UploadContextMenu() {
  return (
    <Menu animation={false} id={UPLOAD_MENU_ID}>
      <Item
        onClick={() => {
          emitEvent('refstudio://menu/references/upload');
        }}
      >
        Upload
      </Item>
      <Item
        onClick={() => {
          emitEvent('refstudio://menu/references/search');
        }}
      >
        Search Semantic Scholar
      </Item>
    </Menu>
  );
}

export interface UploadContextMenuProps {
  id: string;
}

export function useUploadContextMenu() {
  const { show: originalShow } = useContextMenu<UploadContextMenuProps>({ id: 'upload-context-menu' });

  const show = useCallback(
    (e: TriggerEvent) => {
      originalShow({ event: e });
    },
    [originalShow],
  );

  return show;
}
