import { Fragment, Slice } from '@tiptap/pm/model';
import { Transaction } from '@tiptap/pm/state';
import { ReplaceAroundStep } from '@tiptap/pm/transform';

import { NotionBlockNode } from '../NotionBlockNode';

export function addIndentBlockSteps(tr: Transaction, startPos: number, endPos: number): void {
  const resolvedPos = tr.doc.resolve(startPos);
  const indexInParent = resolvedPos.indexAfter();

  if (
    indexInParent === 0 ||
    // For NotionBlockNodes, the first child is an inline block so the index must be greater than 1
    (resolvedPos.parent.type.name === NotionBlockNode.name && indexInParent <= 1)
  ) {
    throw new Error('Cannot indent block without sibling');
  }

  tr.step(
    new ReplaceAroundStep(
      startPos - 1,
      endPos,
      startPos,
      endPos,
      new Slice(Fragment.from(resolvedPos.parent.child(indexInParent - 1)!.copy()), 1, 0),
      0,
    ),
  );
  return;
}
