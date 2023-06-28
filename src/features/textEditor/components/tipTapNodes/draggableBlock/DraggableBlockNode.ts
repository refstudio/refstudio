import { Node } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { isNodeSelection, ReactNodeViewRenderer } from '@tiptap/react';

import { unsetPartiallySelectedCollapsibleBlocks } from '../collapsibleBlock/helpers/unsetPartiallySelectedCollapsibleBlocks';
import { DraggableBlock } from './DraggableBlock';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    draggableBlock: {
      splitDraggableBlock: () => ReturnType;
    };
  }
}

export const DraggableBlockNode = Node.create({
  name: 'draggableBlock',

  content: 'block',
  defining: true,
  draggable: true,
  selectable: true,

  parseHTML: () => [
    {
      tag: 'draggable-block',
    },
  ],

  renderHTML: ({ HTMLAttributes }) => ['draggable-block', HTMLAttributes, 0],

  addNodeView: () => ReactNodeViewRenderer(DraggableBlock),

  addCommands() {
    return {
      ...this.parent?.(),
      splitDraggableBlock:
        () =>
        ({ editor, tr, dispatch }) => {
          const { selection } = tr;
          const { $from, $to } = selection;

          if ((isNodeSelection(selection) && selection.node.isBlock) || $from.depth < 2) {
            return false;
          }

          let draggableBlockDepth = $from.depth;
          while (draggableBlockDepth > 0 && $from.node(draggableBlockDepth).type.name !== this.type.name) {
            draggableBlockDepth -= 1;
          }
          // If selection does not belong to a draggable block, this command does not run
          if (draggableBlockDepth === 0) {
            return false;
          }

          // Create a copy of the block, sliced to before the selection
          let preNode = $from.parent.type.create(
            $from.parent.attrs,
            $from.parent.slice(0, $from.parentOffset).content,
            $from.parent.marks,
          );
          for (let i = $from.depth - 1; i >= draggableBlockDepth; i--) {
            const node = $from.node(i);
            preNode = node.type.create(node.attrs, preNode, node.marks);
          }

          // Create a new draggable block, containing text after the selection
          const postNode = this.type.create(
            null,
            editor.schema.nodes.paragraph.createChecked(null, $to.parent.slice($to.parentOffset).content),
          );

          if (dispatch) {
            const fromPos = $from.pos;

            tr.deleteSelection();

            // Get updated position, after selection has been deleted
            const updatedFromPos = tr.mapping.map(fromPos);
            const resolvedFromPos = tr.doc.resolve(updatedFromPos);

            const fragment = Fragment.from([preNode, postNode]);
            const slice = new Slice(fragment, 0, 0);

            const start = resolvedFromPos.before(draggableBlockDepth);
            const end = resolvedFromPos.after(draggableBlockDepth);

            const step = new ReplaceStep(start, end, slice);
            tr.step(step);

            tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(start) + preNode.nodeSize)));

            dispatch(tr);
          }
          return true;
        },
    };
  },

  addKeyboardShortcuts: () => ({
    Enter: ({ editor }) => editor.chain().command(unsetPartiallySelectedCollapsibleBlocks).splitDraggableBlock().run(),
  }),
});
