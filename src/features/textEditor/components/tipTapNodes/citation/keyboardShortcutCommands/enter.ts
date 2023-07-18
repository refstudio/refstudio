import { KeyboardShortcutCommand } from '@tiptap/core';

import { citationNode } from '../citationNode';

/** Block Enter key when the selection overlaps with a citation node */
export const enter: KeyboardShortcutCommand = ({ editor }) => {
  if (
    editor.state.selection.$from.parent.type.name === citationNode.name ||
    editor.state.selection.$to.parent.type.name === citationNode.name
  ) {
    return true;
  }
  return false;
};
