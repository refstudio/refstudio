import { TextSelection } from '@tiptap/pm/state';
import { KeyboardShortcutCommand } from '@tiptap/react';

export const enter: KeyboardShortcutCommand = function ({ editor }) {
  const { selection } = editor.state;
  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;
  if (
    $from.depth < 2 ||
    $from.parent.type.name !== editor.schema.nodes.collapsibleSummary.name ||
    $from.node(-2).type.name !== editor.schema.nodes.draggableBlock.name
  ) {
    return false;
  }

  // If the collapsible block is collapsed, pressing enter splits it
  if ($from.node(-1).attrs.folded) {
    return editor.commands.splitCollapsibleBlock();
    // Otherwise, it adds an empty content block to the collapsible block
  } else {
    return editor.commands.command(({ dispatch, tr }) => {
      if (dispatch) {
        const postText = $from.parent.slice($from.parentOffset).content;
        const start = $from.before($from.depth) + $from.parentOffset + 1;
        const end = $from.after($from.depth);
        tr.replace(start, end);

        const emptyParagraph = editor.schema.nodes.paragraph.createChecked(null, postText);
        const draggableBlock = editor.schema.nodes.draggableBlock.createChecked(null, emptyParagraph);

        const updatedPos = tr.mapping.map(end) + 1;
        tr.insert(updatedPos, draggableBlock);
        tr.setSelection(TextSelection.near(tr.doc.resolve(updatedPos)));
        dispatch(tr);
      }
      return true;
    });
  }
};
