import { TextSelection } from '@tiptap/pm/state';
import { Command, findParentNodeClosestToPos } from '@tiptap/react';

import { changeCollapsibleBlockToParagraphs } from './changeCollapsibleBlockToParagraphs';

/**
 * Command that unsets any collapsible block that is partially selected,
 * ie. part of the node is selected but not the whole node
 */
export const unsetPartiallySelectedCollapsibleBlocks: Command = ({ dispatch, editor, tr }) => {
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
      if (originalNode.node.nodeSize !== node.nodeSize && originalNode.pos > from) {
        unsetNodes += 1;
        if (dispatch) {
          changeCollapsibleBlockToParagraphs(from + pos, editor.schema, tr);
        }
      }
    }
  });

  const resolvedUpdatedFrom = tr.doc.resolve(from);
  const resolvedUpdatedTo = tr.doc.resolve(to - unsetNodes);

  if (dispatch) {
    tr.setSelection(new TextSelection(resolvedUpdatedFrom, resolvedUpdatedTo));
  }
  return unsetNodes > 0;
};
