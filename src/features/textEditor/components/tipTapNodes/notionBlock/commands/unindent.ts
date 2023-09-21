import { Fragment, Slice } from '@tiptap/pm/model';
import { Transaction } from '@tiptap/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';
import { Command } from '@tiptap/react';

import { NotionBlockNode } from '../NotionBlockNode';
import { BlockSelection } from '../selection/BlockSelection';

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
  const nodesToUnindentPositions: number[] = [];
  const { selection } = tr;
  if (selection instanceof BlockSelection) {
    return false;
  }

  const { from, to } = selection;
  tr.doc.nodesBetween(tr.selection.from, tr.selection.to, (node, pos, parent) => {
    if (node.type.name === NotionBlockNode.name) {
      if (parent?.type.name === NotionBlockNode.name) {
        // Only unindent nodes that are selected (ie their first child is selected)
        const headerSize = node.firstChild!.nodeSize;
        if (from <= pos + headerSize && to >= pos) {
          nodesToUnindentPositions.push(pos);
        }
      }
    } else {
      return false;
    }
  });

  if (dispatch) {
    // Reverse to unindent children first
    nodesToUnindentPositions.reverse().forEach((pos) => {
      addUnindentSteps(tr, pos + 2);
    });
    dispatch(tr);
  }
  return nodesToUnindentPositions.length > 0;
};
