import { Node } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { InputRule, ReactNodeViewRenderer } from '@tiptap/react';

import { CollapsibleBlock } from '../CollapsibleBlock';

export interface CollapsibleBlockNodeAttributes {
  folded: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collapsibleBlock: {
      setCollapsibleBlock: () => ReturnType;
      unsetCollapsibleBlock: () => ReturnType;
    };
  }
}

const inputRegex = /^>\s/;

export const CollapsibleBlockNode = Node.create({
  name: 'collapsibleBlock',

  group: 'block',

  content: 'collapsibleSummary collapsibleContent?',
  defining: true,
  selectable: false,

  parseHTML() {
    return [
      {
        tag: 'collapsible-block',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['collapsible-block', HTMLAttributes, 0];
  },

  addAttributes(): {
    [K in keyof CollapsibleBlockNodeAttributes]: {
      default: CollapsibleBlockNodeAttributes[K];
    };
  } {
    return {
      folded: {
        default: true,
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleBlock);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setCollapsibleBlock:
        () =>
        ({ tr, dispatch, editor }) => {
          if (!('collapsibleSummary' in editor.schema.nodes)) {
            console.warn(
              'Collapsible summary node can not be found in the schema. Did you forget to add it to the configuration?',
            );
            return false;
          }

          if (!tr.selection.empty) {
            return false;
          }

          const { $from } = tr.selection;
          const node = $from.parent;
          if (node.type.name !== 'paragraph') {
            return false;
          }

          if (!editor.schema.nodes.collapsibleSummary.validContent(node.content)) {
            return false;
          }

          if (dispatch) {
            const summary = editor.schema.nodes.collapsibleSummary.create(null, node.content, node.marks);
            const collapsibleBlock = this.type.create({ folded: true }, summary);

            tr.replaceRangeWith($from.before(-1), $from.after(-1), collapsibleBlock);
            dispatch(tr);
          }
          return true;
        },
      unsetCollapsibleBlock:
        () =>
        ({ editor, dispatch, tr }) => {
          if (!('draggableBlock' in editor.schema.nodes)) {
            console.warn(
              'Draggable block node can not be found in the schema. Did you forget to add it to the configuration?',
            );
            return false;
          }
          if (!('paragraph' in editor.schema.nodes)) {
            console.warn(
              'Paragraph node can not be found in the schema. Did you forget to add it to the configuration?',
            );
            return false;
          }

          if (!tr.selection.empty) {
            return false;
          }

          const { $from } = tr.selection;
          if ($from.depth < 1) {
            return false;
          }

          const collapsibleNode = $from.node(-1);
          if (collapsibleNode.type.name !== this.type.name) {
            return false;
          }

          if (dispatch) {
            const summary = collapsibleNode.child(0).content;
            const paragraph = [editor.schema.nodes.paragraph.createChecked(null, summary)];
            const content = [editor.schema.nodes.draggableBlock.createChecked(null, paragraph)];

            if (collapsibleNode.childCount === 2) {
              collapsibleNode.child(1).forEach((node) => {
                content.push(node);
              });
            }
            const fragment = Fragment.from(content);
            const slice = new Slice(fragment, 0, 0);

            const start = $from.before(-2);
            const end = $from.after(-2);

            const step = new ReplaceStep(start, end, slice);
            tr.step(step);

            // + 2 to account for <collapsibleBlock> and <collapsibleSummary> opening tags, that have been removed
            tr.setSelection(TextSelection.near(tr.doc.resolve(start + $from.parentOffset + 2)));

            dispatch(tr);
          }
          return true;
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: inputRegex,
        handler({ chain, range: { from, to } }) {
          chain()
            .command(({ tr, dispatch, state }) => {
              if (dispatch) {
                const start = state.doc.resolve(from);
                const end = state.doc.resolve(to);

                tr.setSelection(new TextSelection(start, end));
                tr.deleteSelection();

                dispatch(tr);
              }
              return true;
            })
            .setCollapsibleBlock()
            .setTextSelection(from)
            .run();
        },
      }),
    ];
  },
});
