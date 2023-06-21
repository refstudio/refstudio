import { KeyboardShortcutCommand } from '@tiptap/react';

export const backspace: KeyboardShortcutCommand = function ({ editor }) {
  const { selection } = editor.state;
  if (!selection.empty) {
    return false;
  }

  // Unsets collapsible block when pressing backspace at the beginning of the block
  if (
    selection.$from.parent.type.name === editor.schema.nodes.collapsibleSummary.name &&
    selection.$from.parentOffset === 0
  ) {
    return editor.commands.unsetCollapsibleBlock();
  }

  // Collapses the block when pressing backspace in a collapsible block that has only one empty block
  if (selection.$from.depth > 3 && selection.$from.node(-2).type.name === editor.schema.nodes.collapsibleContent.name) {
    if (selection.$from.node(-2).nodeSize === 6) {
      return editor.commands.toggleCollapsedCollapsibleBlock(selection.$from.before(-2) - 1);
    }
  }
  return false;
};
