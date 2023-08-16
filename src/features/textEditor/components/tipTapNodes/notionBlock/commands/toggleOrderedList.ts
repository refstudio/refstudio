import { Command } from '@tiptap/react';

import { getTopNodes } from '../utils/getTopNodes';
import { isNotionBlockTypeActive } from '../utils/isNotionBlockTypeActive';

export const toggleOrderedList: Command = ({ tr, dispatch }) => {
  if (dispatch) {
    const topNodes = getTopNodes(tr.selection);
    const orderedListActive = isNotionBlockTypeActive(tr.selection, 'orderedList');

    topNodes.forEach((nodeData) => {
      const { pos } = nodeData.resolvedPos;
      tr.setNodeAttribute(pos, 'collapsed', false);
      if (orderedListActive) {
        tr.setNodeAttribute(pos, 'type', null);
      } else {
        tr.setNodeAttribute(pos, 'type', 'orderedList');
      }
    });
    dispatch(tr);
  }

  return true;
};
