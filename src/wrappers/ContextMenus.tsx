import { FileExplorerFileContextMenu } from '../application/sidebar/fileExplorerContextMenu/FileExplorerFileContextMenu';

interface ContextMenusProps {
  children: React.ReactNode;
}

export function ContextMenus({ children }: ContextMenusProps) {
  return (
    <>
      {children}
      <FileExplorerFileContextMenu />
    </>
  );
}