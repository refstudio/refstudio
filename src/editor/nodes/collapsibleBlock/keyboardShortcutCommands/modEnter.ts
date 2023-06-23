import { KeyboardShortcutCommand } from '@tiptap/react';

export const modEnter: KeyboardShortcutCommand = ({ editor }) => {
  if (!editor.state.selection.empty) {
    return false;
  }
  return editor.commands.toggleCollapsedCollapsibleBlock(editor.state.selection.from);
};
