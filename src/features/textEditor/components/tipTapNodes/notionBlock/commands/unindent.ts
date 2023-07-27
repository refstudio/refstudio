import { Fragment, Slice } from '@tiptap/pm/model';
import { Transaction } from '@tiptap/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';
import { Command } from '@tiptap/react';

import { NotionBlockNode } from '../NotionBlockNode';

export function addUnindentSteps(tr: Transaction, pos: number): void {
  const resolvedPos = tr.doc.resolve(pos);
  const grandParent = resolvedPos.node(-2);
  const parent = resolvedPos.node(-1);
  const start = resolvedPos.before(-1);
  const end = resolvedPos.after(-1);
  tr.step(new ReplaceStep(start, start, new Slice(Fragment.from([grandParent.copy(), parent.copy()]), 1, 1), true));
  const updatedStart = start + 2;
  const updatedEnd = end + 2;
  tr.step(new ReplaceAroundStep(updatedStart, updatedEnd, updatedStart + 1, updatedEnd - 1, Slice.empty, 0, true));
}

export const unindent: Command = ({ tr, dispatch }) => {
  const { $from } = tr.selection;
  if (!tr.selection.empty || $from.node(-1).type.name !== NotionBlockNode.name) {
    return true;
  }

  // If the current node's grandparent is not a NotionBlockNode, then the node cannot be unindented
  if ($from.depth <= 2 || $from.node(-2).type.name !== NotionBlockNode.name) {
    return true;
  }

  if (dispatch) {
    addUnindentSteps(tr, $from.pos);

    dispatch(tr);
  }
  return true;
};
