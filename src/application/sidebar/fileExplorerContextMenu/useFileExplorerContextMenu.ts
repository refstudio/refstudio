import { useCallback } from 'react';
import { TriggerEvent, useContextMenu } from 'react-contexify';

import { isInUploadsDir } from '../../../io/filesystem';

export interface FileExplorerContextMenuProps {
  id: string;
}

export function useFileExplorerContextMenu(id: string, props: FileExplorerContextMenuProps) {
  const { show: originalShow } = useContextMenu<FileExplorerContextMenuProps>({ id, props });

  const show = useCallback(
    (e: TriggerEvent) => {
      // Context menu is disabled for the uploads directory
      if (!isInUploadsDir(props.id)) {
        originalShow({ event: e });
      }
    },
    [props.id, originalShow],
  );

  return show;
}
