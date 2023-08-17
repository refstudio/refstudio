// THIS FILE IS GENERATED. Edit menu.json instead.
import React from 'react';

declare const MenuBar: React.ComponentType<any>;
declare const Menu: React.ComponentType<any>;
declare const NativeMenuItem: React.ComponentType<any>;
declare const MenuSeparator: React.ComponentType<any>;
declare const MenuItem: React.ComponentType<any>;

export function AppMenu() {
  <MenuBar>
    <Menu title="">
      <NativeMenuItem item="About" />
      <MenuSeparator />
      <MenuItem accelerator="cmdOrControl+," id="refstudio://menu/settings" title="Settings" />
      <MenuSeparator />
      <NativeMenuItem item="Services" />
      <NativeMenuItem item="Hide" />
      <NativeMenuItem item="HideOthers" />
      <MenuSeparator />
      <NativeMenuItem item="Quit" />
    </Menu>
    <Menu title="File">
      <MenuItem accelerator="cmdOrControl+N" id="refstudio://menu/file/new" title="New File" />
      <MenuItem accelerator="cmdOrControl+S" id="refstudio://menu/file/save" title="Save" />
      <MenuItem id="refstudio://menu/file/markdown" title="Save File as Markdown..." />
      <MenuSeparator />
      <MenuItem id="refstudio://menu/file/project/new" title="New Project" />
      <MenuItem id="refstudio://menu/file/project/open" title="Open Project" />
      <MenuItem id="refstudio://menu/file/project/close" title="Close Project" />
      <MenuSeparator />
      <MenuItem accelerator="cmdOrControl+W" id="refstudio://menu/file/close" title="Close Editor" />
      <MenuItem id="refstudio://menu/file/close/all" title="Close All Editors" />
    </Menu>
    <Menu title="Edit">
      <NativeMenuItem item="Undo" />
      <NativeMenuItem item="Redo" />
      <MenuSeparator />
      <NativeMenuItem item="Cut" />
      <NativeMenuItem item="Copy" />
      <NativeMenuItem item="Paste" />
      <NativeMenuItem item="SelectAll" />
    </Menu>
    <Menu title="References">
      <MenuItem accelerator="cmdOrControl+R" id="refstudio://menu/references/open" title="Open" />
      <MenuItem id="refstudio://menu/references/upload" title="Upload..." />
    </Menu>
    <Menu title="View">
      <NativeMenuItem item="EnterFullScreen" />
      <MenuItem accelerator="F11" id="refstudio://menu/view/notifications" title="Notifications" />
    </Menu>
    <Menu title="Window">
      <NativeMenuItem item="Minimize" />
      <NativeMenuItem item="Zoom" />
    </Menu>
  </MenuBar>;
}
