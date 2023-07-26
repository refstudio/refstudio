import './contextMenus.css';

import { FileExplorerFileContextMenu } from '../application/sidebar/fileExplorerContextMenu/FileExplorerFileContextMenu';
import { TabPaneTabContextMenu } from '../components/TabPaneTabContextMenu';

interface ContextMenusProps {
  children: React.ReactNode;
}

export function ContextMenus({ children }: ContextMenusProps) {
  return (
    <>
      {children}
      <FileExplorerFileContextMenu />
      <TabPaneTabContextMenu />
    </>
  );
}
