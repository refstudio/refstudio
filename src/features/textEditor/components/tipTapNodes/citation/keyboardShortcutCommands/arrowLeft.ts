import { KeyboardShortcutCommand } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

import { citationNode } from '../citationNode';

/** Enable escaping the citation node when pressing ArrowLeft while being at the start of the node */
export const arrowLeft: KeyboardShortcutCommand = ({ editor }) => {
  if (!editor.state.selection.empty) {
    return false;
  }

  const { $from } = editor.state.selection;
  if ($from.parent.type.name !== citationNode.name || $from.pos !== $from.before() + 1) {
    return false;
  }

  const resolvedBeforePos = editor.state.doc.resolve($from.before());
  const maybePreviousNode = resolvedBeforePos.nodeBefore;
  const { tr } = editor.state;
  if (!maybePreviousNode) {
    tr.insert(resolvedBeforePos.pos, editor.schema.text(' '));
  }
  tr.setSelection(TextSelection.create(tr.doc, $from.before()));

  editor.view.dispatch(tr);
  return true;
};
