import { NodeType } from '@tiptap/pm/model';
import { Command } from '@tiptap/react';

export const toggleBulletList: Command = function (
  this: {
    name: string;
    type: NodeType;
  },
  { tr, dispatch },
) {
  const { $from, $to, empty } = tr.selection;
  const sharedDepth = empty ? -2 : $from.sharedDepth($to.pos);
  if ($from.node(sharedDepth + 1).type.name !== this.name) {
    return false;
  }

  if (dispatch) {
    const fromIndexInParent = $from.indexAfter(sharedDepth);
    const toIndexInParent = $to.indexAfter(sharedDepth);
    const parent = $from.node(sharedDepth);
    let hasChanged = false;
    let pos = $from.posAtIndex(fromIndexInParent - 1, sharedDepth);

    for (let i = fromIndexInParent - 1; i < toIndexInParent; i++) {
      const node = parent.child(i);
      if (node.attrs.type !== 'bulletList') {
        hasChanged = true;
        tr.setNodeAttribute(pos, 'type', 'bulletList');
        tr.setNodeAttribute(pos, 'collapsed', false);
      }
      pos += node.nodeSize;
    }

    // If all nodes were bullet items, unset them
    pos = $from.posAtIndex(fromIndexInParent - 1, sharedDepth);
    if (!hasChanged) {
      for (let i = fromIndexInParent - 1; i < toIndexInParent; i++) {
        const node = parent.child(i);
        tr.setNodeAttribute(pos, 'type', null);
        tr.setNodeAttribute(pos, 'collapsed', false);
        pos += node.nodeSize;
      }
    }

    dispatch(tr);
  }
  return true;
};
