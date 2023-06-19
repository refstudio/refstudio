import { Node } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { findParentNodeClosestToPos, InputRule, ReactNodeViewRenderer } from '@tiptap/react';

import { isNonNullish } from '../../../lib/isNonNullish';
import { CollapsibleBlock } from '../CollapsibleBlock';
import { unsetCollapsibleBlock } from '../helpers/unsetCollapsibleBlock';

export interface CollapsibleBlockNodeAttributes {
  folded: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collapsibleBlock: {
      setCollapsibleBlock: () => ReturnType;
      splitCollapsibleBlock: () => ReturnType;
      toggleCollapsedCollapsibleBlock: (pos: number) => ReturnType;
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
      splitCollapsibleBlock:
        () =>
        ({ editor, dispatch, tr }) => {
          if (!tr.selection.empty) {
            return false;
          }

          const { $from } = tr.selection;

          if (
            $from.depth < 2 ||
            $from.parent.type.name !== editor.schema.nodes.collapsibleSummary.name ||
            $from.node(-2).type.name !== editor.schema.nodes.draggableBlock.name
          ) {
            return false;
          }

          if (dispatch) {
            const preSummary = $from.parent.type.create(
              $from.parent.attrs,
              $from.parent.slice(0, $from.parentOffset).content,
              $from.parent.marks,
            );
            const preContent = $from.node(-1).childCount === 2 ? $from.node(-1).child(1) : null;

            const preCollapsibleBlock = this.type.create(
              $from.node(-1).attrs,
              Fragment.from([preSummary, preContent].filter(isNonNullish)),
              $from.node(-1).marks,
            );

            const preDraggableBlock = editor.schema.nodes.draggableBlock.create(
              $from.node(-2).attrs,
              preCollapsibleBlock,
              $from.node(-2).marks,
            );

            const postSummary = $from.parent.type.create(
              $from.parent.attrs,
              $from.parent.slice($from.parentOffset).content,
              $from.parent.marks,
            );
            const postCollapsibleBlock = this.type.create($from.node(-1).attrs, postSummary, $from.node(-1).marks);
            const postDraggableBlock = editor.schema.nodes.draggableBlock.create(
              $from.node(-2).attrs,
              postCollapsibleBlock,
              $from.node(-2).marks,
            );

            const fragment = Fragment.from([preDraggableBlock, postDraggableBlock]);
            const slice = new Slice(fragment, 0, 0);

            const start = $from.before(-2);
            const end = $from.after(-2);

            const step = new ReplaceStep(start, end, slice);
            tr.step(step);

            tr.setSelection(TextSelection.near(tr.doc.resolve(start + preDraggableBlock.nodeSize)));

            dispatch(tr);
          }
          return true;
        },
      toggleCollapsedCollapsibleBlock:
        (pos) =>
        ({ editor, dispatch, tr }) => {
          const resolvedPos = tr.doc.resolve(pos);

          const collapsibleSummaryParent = findParentNodeClosestToPos(
            resolvedPos,
            (node) => node.type.name === editor.schema.nodes.collapsibleSummary.name,
          );
          if (!collapsibleSummaryParent) {
            return false;
          }

          const { depth } = collapsibleSummaryParent;
          const collapsibleBlock = resolvedPos.node(depth - 1);
          const collapsibleBlockStartPos = resolvedPos.before(depth - 1);

          const { folded } = collapsibleBlock.attrs;

          if (dispatch) {
            tr.setNodeAttribute(collapsibleBlockStartPos, 'folded', !folded);
            if (!folded) {
              // Reset selection if it was inside the content
              if (collapsibleBlock.childCount === 2) {
                const { from, to } = tr.selection;

                const contentStart = collapsibleBlockStartPos + collapsibleBlock.child(0).nodeSize;
                const contentEnd = contentStart + collapsibleBlock.child(1).nodeSize;

                // If the intervals [from, to] and [contentStart, contentEnd] overlap,
                // ie. part of the content is selected
                if (from <= contentEnd && contentStart <= to) {
                  tr.setSelection(TextSelection.near(tr.doc.resolve(contentStart), -1));
                }
              }
              // If the block was unfolded and with empty content block, remove the content block
              if (collapsibleBlock.childCount === 2 && collapsibleBlock.child(1).nodeSize === 6) {
                const start = collapsibleBlockStartPos + 1 + collapsibleBlock.child(0).nodeSize;
                const end = start + 6;

                tr.delete(start, end);
              }
              // If the collapsible block does not have content, add an empty content block
            } else if (collapsibleBlock.childCount === 1) {
              // If the collapsible block does not have content, add an empty content block
              const emptyParagraph = editor.schema.nodes.paragraph.createChecked();
              const draggableBlock = editor.schema.nodes.draggableBlock.createChecked(null, emptyParagraph);
              const contentBlock = editor.schema.nodes.collapsibleContent.createChecked(null, draggableBlock);

              const posAfterSummary = collapsibleBlockStartPos + collapsibleBlock.nodeSize - 1;

              tr.insert(posAfterSummary, contentBlock);
              dispatch(tr);
            }
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
            const start = $from.before(-2);

            unsetCollapsibleBlock($from.pos, editor.schema, tr);

            // + 2 to account for <collapsibleBlock> and <collapsibleSummary> opening tags, that have been removed
            tr.setSelection(TextSelection.near(tr.doc.resolve(start + $from.parentOffset + 2)));

            dispatch(tr);
          }
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        if (!selection.empty) {
          return false;
        }

        // Unsets collapsible block when pressing backspace at the beginning of the block
        if (
          selection.$from.parent.type.name === editor.schema.nodes.collapsibleSummary.name &&
          selection.$from.parentOffset === 0
        ) {
          return editor.commands.unsetCollapsibleBlock();
        }

        // Collapses the block when pressing backspace in a collapsible block that has only one empty block
        if (
          selection.$from.depth > 3 &&
          selection.$from.node(-2).type.name === editor.schema.nodes.collapsibleContent.name
        ) {
          if (selection.$from.node(-2).nodeSize === 6) {
            return editor.commands.toggleCollapsedCollapsibleBlock(selection.$from.before(-2) - 1);
          }
        }
        return false;
      },
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        if (!selection.empty) {
          return false;
        }

        const { $from } = selection;
        if (
          $from.depth < 2 ||
          $from.parent.type.name !== editor.schema.nodes.collapsibleSummary.name ||
          $from.node(-2).type.name !== editor.schema.nodes.draggableBlock.name
        ) {
          return false;
        }

        // If the collapsible block is collapsed, pressing enter splits it
        if ($from.node(-1).attrs.folded) {
          return editor.commands.splitCollapsibleBlock();
          // Otherwise, it adds an empty content block to the collapsible block
        } else {
          return editor.commands.command(({ dispatch, tr }) => {
            if (dispatch) {
              const postText = $from.parent.slice($from.parentOffset).content;
              const start = $from.before($from.depth) + $from.parentOffset + 1;
              const end = $from.after($from.depth);
              tr.replace(start, end);

              const emptyParagraph = editor.schema.nodes.paragraph.createChecked(null, postText);
              const draggableBlock = editor.schema.nodes.draggableBlock.createChecked(null, emptyParagraph);

              const updatedPos = tr.mapping.map(end) + 1;
              tr.insert(updatedPos, draggableBlock);
              tr.setSelection(TextSelection.near(tr.doc.resolve(updatedPos)));
              dispatch(tr);
            }
            return true;
          });
        }
      },
      'Mod-Enter': ({ editor }) => {
        if (!editor.state.selection.empty) {
          return false;
        }
        return editor.commands.toggleCollapsedCollapsibleBlock(editor.state.selection.from);
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
            .setTextSelection(from + 1)
            .toggleCollapsedCollapsibleBlock(from + 1)
            .run();
        },
      }),
    ];
  },
});
