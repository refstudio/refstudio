import { Fragment, Slice } from '@tiptap/pm/model';
import { Transaction } from '@tiptap/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';
import { Command } from '@tiptap/react';

import { NotionBlockNode } from '../NotionBlockNode';

export function addIndentSteps(tr: Transaction, pos: number): void {
  const resolvedPos = tr.doc.resolve(pos);
  const start = resolvedPos.before();
  const end = resolvedPos.after();
  tr.step(
    new ReplaceAroundStep(start, end, start, end, new Slice(Fragment.from(resolvedPos.node(-1).copy()), 0, 0), 1, true),
  );

  // Remove the </notionBlock><notionBlock> created during the intermediate step
  const updatedStart = resolvedPos.before(-1) - 1;
  tr.step(new ReplaceStep(updatedStart, updatedStart + 2, Slice.empty, true));
}

export const indent: Command = ({ tr, dispatch }) => {
  const { $from } = tr.selection;
  if (!tr.selection.empty || $from.node(-1).type.name !== NotionBlockNode.name) {
    return true;
  }

  // If the current node does not have a NotionBlockNode sibling, the node cannot be indented
  const indexInParent = $from.indexAfter(-2);
  if (
    ($from.node(-2).type.name === 'doc' && indexInParent < 2) ||
    ($from.node(-2).type.name === NotionBlockNode.name && indexInParent < 3)
  ) {
    return true;
  }

  if (dispatch) {
    addIndentSteps(tr, $from.pos);

    dispatch(tr);
  }
  return true;
};
