import { Fragment, Slice } from '@tiptap/pm/model';
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';
import { Command } from '@tiptap/react';

import { NotionBlockNode } from '../NotionBlockNode';

export const indent: Command = ({ tr, dispatch }) => {
  const { $from } = tr.selection;
  if (!tr.selection.empty || $from.node(-1).type.name !== NotionBlockNode.name) {
    return false;
  }

  // If the current node does not have a NotionBlockNode sibling, the node cannot be indented
  const indexInParent = $from.indexAfter(-2);
  if (
    ($from.node(-2).type.name === 'doc' && indexInParent < 2) ||
    ($from.node(-2).type.name === NotionBlockNode.name && indexInParent < 3)
  ) {
    return false;
  }

  if (dispatch) {
    const start = $from.before();
    const end = $from.after();
    tr.step(
      new ReplaceAroundStep(start, end, start, end, new Slice(Fragment.from($from.node(-1).copy()), 0, 0), 1, true),
    );

    // Remove the </notionBlock><notionBlock> created during the intermediate step
    const updatedStart = tr.mapping.map($from.before(-1));
    tr.step(new ReplaceStep(updatedStart - 1, updatedStart + 1, Slice.empty, true));

    dispatch(tr);
  }
  return true;
};
