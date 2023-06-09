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
            // const preNode = grandParent.type.create(
            //   grandParent.attrs,
            //   $from.parent.type.create(
            //     $from.parent.attrs,
            //     $from.parent.slice(0, $from.parentOffset).content,
            //     $from.parent.marks,
            //   ),
            //   grandParent.marks,
            // );
            // content.push(preNode);

            // const postNode = grandParent.type.create(
            //   grandParent.attrs,
            //   $to.parent.type.create(
            //     $to.parent.attrs,
            //     $to.node($from.depth).slice($to.parentOffset).content,
            //     $to.parent.marks,
            //   ),
            //   grandParent.marks,
            // );
            // content.push(postNode);

            // const fragment = Fragment.from(content);
            // console.log(fragment)
            // const slice = new Slice(fragment, 0, 0);

            // console.log($from.sharedDepth($to.before($to.depth)))

            // const grandParentStart = $from.before(-1);
            // const grandParentEnd = $to.after(-1);

            // const step = new ReplaceStep(grandParentStart, grandParentEnd, slice);
            // tr.step(step);

            const preNode = grandParent.type.create(
              grandParent.attrs,
              $from.parent.type.create(
                $from.parent.attrs,
                $from.parent.slice(0, $from.parentOffset).content,
                $from.parent.marks,
              ),
              grandParent.marks,
            );
            const postNode = grandParent.type.create(
              grandParent.attrs,
              $from.parent.type.create(
                $from.parent.attrs,
                $to.parent.slice($to.parentOffset).content,
                $from.parent.marks,
              ),
              grandParent.marks,
            );

            const sharedDepth = $from.sharedDepth($to.before($to.depth + 1));

            let content: NodeType | NodeType[] = [preNode, postNode];
            for (let i = $from.depth - 2; i > sharedDepth; i--) {
              const parent = $from.node(i);
              content = parent.type.create(parent.attrs, content, parent.marks);
            }

            const start = sharedDepth === $from.depth ? $from.before(-1) : $from.before(sharedDepth + 1);
            const end = sharedDepth === $from.depth ? $to.after(-1) : $to.after(sharedDepth + 1);

            const fragment = Fragment.from(content);
            const slice = new Slice(fragment, 0, 0);

            const step = new ReplaceStep(start, end, slice);
            tr.step(step);

            tr.setSelection(TextSelection.near(tr.doc.resolve(start + preNode.nodeSize + 2)));

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
