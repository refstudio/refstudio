import { TextSelection } from '@tiptap/pm/state';
import { Command, findParentNodeClosestToPos } from '@tiptap/react';

import { unsetCollapsibleBlock } from './unsetCollapsibleBlock';

/**
 * Command that unsets any collapsible block that is partially selected,
 * ie. part of the node is selected but not the whole node
 */
export function unsetPartiallySelectedCollapsibleBlocks({ tr, editor }: Parameters<Command>[0]) {
  const { from, to } = tr.selection;
  let unsetNodes = 0;

  tr.selection.content().content.descendants((node, pos) => {
    if (node.type.name === editor.schema.nodes.collapsibleBlock.name) {
      const originalNode = findParentNodeClosestToPos(
        tr.doc.resolve(from + pos),
        (n) => n.type.name === editor.schema.nodes.collapsibleBlock.name,
      );
      if (!originalNode) {
        return;
      }
      if (originalNode.node.nodeSize !== node.nodeSize) {
        unsetNodes += 1;
        unsetCollapsibleBlock(from + pos, editor.schema, tr);
      }
    }
  });

  const $updatedFrom = tr.doc.resolve(from);
  const $updatedTo = tr.doc.resolve(to - unsetNodes);

  tr.setSelection(new TextSelection($updatedFrom, $updatedTo));
  return true;
}
