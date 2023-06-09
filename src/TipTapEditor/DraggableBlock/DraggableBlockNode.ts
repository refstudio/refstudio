import { Node } from '@tiptap/core';
import { Fragment, Node as NodeType, Slice } from '@tiptap/pm/model';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';

import { DraggableBlock } from './DraggableBlock';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    splitDraggableBlock: {
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
        tag: 'div[data-type="draggable-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'draggable-block' }), 0];
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
          const { $from, $to } = state.selection;
          const selection = state.selection as NodeSelection | Selection;

          if (('node' in selection && selection.node.isBlock) || $from.depth < 2) {
            return false;
          }

          const grandParent = $from.node(-1);
          if (grandParent.type.name !== this.type.name) {
            return false;
          }

          /* We have
          <...>
            <collapsibleBlock>
              <block>...</block>
            </collapsibleBlock>
          </...>
          
          Splitting it should result in
          <...>
            <collapsibleBlock>
              <block>...</block>
            </collapsibleBlock>
            <collapsibleBlock>
              <block>...</block>
            </collapsibleBlock>
          </...> */
          if (dispatch) {
            const content: NodeType[] = [];
            const preNode = grandParent.type.create(
              grandParent.attrs,
              $from.parent.type.create(
                $from.parent.attrs,
                $from.parent.slice(0, $from.parentOffset).content,
                $from.parent.marks,
              ),
              grandParent.marks,
            );
            content.push(preNode);

            const postNode = grandParent.type.create(
              grandParent.attrs,
              $from.parent.type.create(
                $from.parent.attrs,
                $to.parent.slice($to.parentOffset).content,
                $from.parent.marks,
              ),
              grandParent.marks,
            );
            content.push(postNode);

            const fragment = Fragment.from(content);
            const slice = new Slice(fragment, 0, 0);

            const grandParentStart = $from.before(-1);
            const grandParentEnd = $to.after(-1);

            const step = new ReplaceStep(grandParentStart, grandParentEnd, slice);
            tr.step(step);

            tr.setSelection(TextSelection.near(tr.doc.resolve(grandParentStart + preNode.nodeSize)));

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
