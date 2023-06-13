import { Node } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { InputRule, ReactNodeViewRenderer } from '@tiptap/react';

import { CollapsibleBlock } from '../CollapsibleBlock';

export interface CollapsibleBlockNodeAttributes {
  folded: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collapsibleBlock: {
      setCollapsibleBlock: () => ReturnType;
      toggleCollapsibleBlock: () => ReturnType;
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
              'Collapsible summary can not be found in the schema. Did you forget to add it to configuration?',
            );
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
      toggleCollapsibleBlock:
        () =>
        ({ tr, dispatch }) => {
          const { selection } = tr;

          if (dispatch) {
            //
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
