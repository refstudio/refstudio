import { Command } from '@tiptap/react';

import { getTopNodes } from '../utils/getTopNodes';
import { isNotionBlockTypeActive } from '../utils/isNotionBlockTypeActive';

export const toggleUnorderedList: Command = ({ tr, dispatch }) => {
  if (dispatch) {
    const topNodes = getTopNodes(tr.selection);
    const unorderedListActive = isNotionBlockTypeActive(tr.selection, 'unorderedList');

    topNodes.forEach((nodeData) => {
      const { pos } = nodeData.resolvedPos;
      tr.setNodeAttribute(pos, 'collapsed', false);
      if (unorderedListActive) {
        tr.setNodeAttribute(pos, 'type', null);
      } else {
        tr.setNodeAttribute(pos, 'type', 'unorderedList');
      }
    });
    dispatch(tr);
  }

  return true;
};
