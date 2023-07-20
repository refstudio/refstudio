import { KeyboardShortcutCommand } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

import { CitationNode } from '../CitationNode2';

/** Enable escaping the citation node when pressing ArrowRight while being at the end of the node */
export const arrowRight: KeyboardShortcutCommand = ({ editor }) => {
  if (!editor.state.selection.empty) {
    return false;
  }

  const { $from } = editor.state.selection;
  if ($from.parent.type.name !== CitationNode.name || $from.pos !== $from.after() - 1) {
    return false;
  }

  const { tr } = editor.state;

  const resolvedAfterPos = editor.state.doc.resolve($from.after());
  if (!resolvedAfterPos.nodeAfter) {
    tr.insert(resolvedAfterPos.pos, editor.schema.text(' '));
  }
  tr.setSelection(TextSelection.create(tr.doc, $from.after() + 1));

  editor.view.dispatch(tr);
  return true;
};
