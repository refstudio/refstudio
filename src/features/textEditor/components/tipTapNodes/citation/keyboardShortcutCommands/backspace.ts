import { KeyboardShortcutCommand } from '@tiptap/core';

import { citationNode } from '../citationNode';

/**
 * Rules when pressing backspace:
 * - removes the citation node when it becomes empty
 * - blocks Backspace key when the selection overlaps with a citation node
 */
export const backspace: KeyboardShortcutCommand = ({ editor }) => {
  const { selection, tr } = editor.state;
  const { $from, $to } = selection;

  // If the selection does not starts or ends in a citation node, let other handlers handle it
  if ($from.parent.type.name !== citationNode.name && $to.parent.type.name !== citationNode.name) {
    return false;
  }

  // If the selection starts or ends in a different node, block the event
  if (!$from.sameParent($to)) {
    return true;
  }

  const childrenToRemove = selection.empty ? 1 : selection.to - selection.from;
  // If the current selection is not the entire citation node's content, let others handlers handle the event
  // 2 is to account for the <citation> and </citation> tags
  if ($from.parent.nodeSize !== childrenToRemove + 2) {
    return false;
  }

  // Otherwise, remove the citation node
  const start = $from.before();
  const end = start + $from.parent.nodeSize;
  tr.insertText('[', start, end);
  editor.view.dispatch(tr);
  return true;
};
