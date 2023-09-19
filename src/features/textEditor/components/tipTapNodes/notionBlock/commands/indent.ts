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
  const nodesToIndentPositions: number[] = [];
  const { from, to } = tr.selection;

  tr.doc.nodesBetween(tr.selection.from, tr.selection.to, (node, pos, parent, index) => {
    if (node.type.name === NotionBlockNode.name) {
      if ((parent?.type.name === NotionBlockNode.name && index > 1) || index > 0) {
        // Only unindent nodes that are selected (ie their first child is selected)
        const headerSize = node.firstChild!.nodeSize;
        if (from <= pos + headerSize && to >= pos) {
          nodesToIndentPositions.push(pos);
        }
      }
    } else {
      return false;
    }
  });

  if (dispatch) {
    nodesToIndentPositions.forEach((pos) => {
      addIndentSteps(tr, pos + 2);
    });
    dispatch(tr);
  }
  return nodesToIndentPositions.length > 0;
};
