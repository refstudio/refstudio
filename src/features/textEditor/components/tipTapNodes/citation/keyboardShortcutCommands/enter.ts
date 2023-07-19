import { KeyboardShortcutCommand } from '@tiptap/core';

import { CitationNode } from '../CitationNode';

/** Block Enter key when the selection overlaps with a citation node */
export const enter: KeyboardShortcutCommand = ({ editor }) => {
  if (
    editor.state.selection.$from.parent.type.name === CitationNode.name ||
    editor.state.selection.$to.parent.type.name === CitationNode.name
  ) {
    return true;
  }
  return false;
};
