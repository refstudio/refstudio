import { KeyboardShortcutCommand } from '@tiptap/core';

import { citationNode } from '../citationNode';

/**
 * Rules when pressing backspace:
 * - removes the citation node when it becomes empty
 * - blocks Backspace key when the selection overlaps with a citation node
 */
export const backspace: KeyboardShortcutCommand = ({ editor }) => {
  const { selection, tr } = editor.state;
  // Blocks the event for non-empty selections overlapping with the citation node
  if (
    !selection.empty &&
    (selection.$from.parent.type.name === citationNode.name || selection.$to.parent.type.name === citationNode.name)
  ) {
    return true;
  }

  // Let other handlers handle the event when the selection is not empty or the node is not a citation node
  const { $from } = selection;
  if (!selection.empty || $from.parent.type.name !== citationNode.name) {
    return false;
  }

  // If the current element is not the last element of the citation node, let others handlers handle the event
  if ($from.parent.childCount !== 1 || $from.parent.child(0).nodeSize !== 1) {
    return false;
  }

  // Otherwise, remove the citation node
  const start = $from.before();
  const end = start + $from.parent.nodeSize;
  tr.delete(start, end);
  editor.view.dispatch(tr);
  return true;
};
