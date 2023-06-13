import { Node } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { ReactNodeViewRenderer } from '@tiptap/react';

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

  parseHTML() {
    return [
      {
        tag: 'draggable-block',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['draggable-block', HTMLAttributes, 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DraggableBlock);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      splitDraggableBlock:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { $from, $to } = selection;

          if (('node' in selection && (selection as NodeSelection).node.isBlock) || $from.depth < 2) {
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
            $to.parent.type.create($to.parent.attrs, $to.parent.slice($to.parentOffset).content, $to.parent.marks),
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

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => editor.commands.splitDraggableBlock(),
    };
  },
});
