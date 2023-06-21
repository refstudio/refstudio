import { TextSelection } from '@tiptap/pm/state';
import { isNodeSelection, KeyboardShortcutCommand } from '@tiptap/react';

export const backspace: KeyboardShortcutCommand = function ({ editor }) {
  if (editor.state.selection.empty && editor.state.selection.$from.parentOffset === 0) {
    // Removes the content item and moves the selection to the previous content item or the header
    return editor.commands.command(({ tr, dispatch }) => {
      const { $from } = editor.state.selection;
      if (dispatch) {
        const start = $from.before(-1);
        const end = $from.after(-1);
        const deletedSlice = tr.doc.slice(start, end);
        tr.delete(start, end);

        const resolvedInsertPos = TextSelection.near(tr.doc.resolve(start), -1);
        const initialInsertPos = resolvedInsertPos.from;

        let insertPos = initialInsertPos;
        deletedSlice.content.descendants((node) => {
          if (node.type.name === 'text') {
            tr.insert(insertPos, node);
            insertPos += node.nodeSize;
          }
        });
        tr.setSelection(TextSelection.near(tr.doc.resolve(initialInsertPos)));

        dispatch(tr);
      }
      return true;
    });
  }
  if (editor.state.selection.empty || isNodeSelection(editor.state.selection)) {
    return false;
  }
  return editor.commands.deleteNonEmptySelection();
};
