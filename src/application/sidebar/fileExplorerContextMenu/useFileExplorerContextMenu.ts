import { useCallback } from 'react';
import { TriggerEvent, useContextMenu } from 'react-contexify';

export interface FileExplorerContextMenuProps {
  id: string;
}

export function useFileExplorerContextMenu(id: string, props: FileExplorerContextMenuProps) {
  const { show: originalShow } = useContextMenu<FileExplorerContextMenuProps>({ id, props });

  const show = useCallback(
    (e: TriggerEvent) => {
      originalShow({ event: e });
    },
    [originalShow],
  );

  return show;
}
