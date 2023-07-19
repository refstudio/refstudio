import { InputRule, Node } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { referenceNode } from '../references/referenceNode';
import { Citation } from './Citation';
import { squareBracketHandler } from './inputRuleHandlers/squareBracketHandler';
import { arrowRight } from './keyboardShortcutCommands/arrowRight';
import { backspace } from './keyboardShortcutCommands/backspace';
import { enter } from './keyboardShortcutCommands/enter';

type CitationPluginState = number | null;

const inputRegex = /\[$/;

const citationPluginKey = new PluginKey('citationPlugin');

/**
 * Plugin that adds a '; ' decoration after a reference in a citation node
 * The state contains the position at which the decoration should be added
 * Adding text in the citation node actually adds the '; ' text to the document
 * */
const citationPlugin = new Plugin<CitationPluginState>({
  key: citationPluginKey,

  state: {
    init: () => null,
    apply: (tr, _value, _oldState, newState) => {
      if (!newState.selection.empty) {
        return null;
      }

      const { $from } = newState.selection;

      // If the transaction does not happen in a citation node or is not at the end of the citation node,
      // there is nothing to do
      if ($from.parent.type.name !== citationNode.name || $from.pos !== $from.after() - 1) {
        return null;
      }

      const { parent } = $from;

      // If the last child of the citation node is not a reference, nothing to do
      if (parent.child(parent.childCount - 1).type.name !== referenceNode.name) {
        return null;
      }

      // Otherwise, add a decoration
      return newState.selection.from;
    },
  },

  // Inserts '; ' in the document when writing something after a reference, at the end of a citation node
  appendTransaction: (transactions, oldState, newState) => {
    if (!newState.selection.empty) {
      return null;
    }

    const { tr } = newState;
    const oldPluginState = citationPluginKey.getState(oldState) as CitationPluginState;

    // If there was no decoration before the update, nothing to do
    if (!oldPluginState) {
      return null;
    }

    const { $from } = newState.selection;
    const { parent } = $from;

    // If the selection after the update is not at the end of the citation node, nothing to do
    if (parent.type.name !== citationNode.name || $from.nodeAfter) {
      return null;
    }

    // Otherwise, if there was a replace step that added something in the citation node, we insert '; ' in the document
    if (
      transactions.find((transaction) =>
        transaction.steps.find(
          (step) => step instanceof ReplaceStep && step.from === step.to && step.from === oldPluginState,
        ),
      )
    ) {
      tr.insertText('; ', oldPluginState);
      return tr;
    }

    return null;
  },

  props: {
    decorations(state) {
      const decorationPos = this.getState(state) as CitationPluginState;
      if (!decorationPos) {
        return null;
      }
      return DecorationSet.create(state.doc, [
        Decoration.widget(
          decorationPos,
          () => {
            const parentNode = document.createElement('span');

            parentNode.innerHTML = '; ';
            parentNode.style.color = 'hsl(var(--color-muted))';

            return parentNode;
          },
          {
            side: -1,
          },
        ),
      ]);
    },
  },
});

/**
 * Plugin that prevents the cursor from being directly after the opening and closing brackets of citation nodes
 */
const moveCursorPluginKey = new PluginKey('moveCursor');
const moveCursorPlugin = new Plugin({
  key: moveCursorPluginKey,
  appendTransaction: (_transactions, oldState, newState) => {
    if (!newState.selection.empty) {
      return null;
    }

    const { doc, schema, selection, tr } = newState;
    const { $from } = selection;

    const isAfterOpeningBracket = $from.parent.type.name === citationNode.name && $from.nodeBefore === null;
    const isAfterClosingBracket = $from.nodeBefore?.type.name === citationNode.name;

    if (!isAfterOpeningBracket && !isAfterClosingBracket) {
      return null;
    }

    const wasAfterBeforeOpeningBracket =
      oldState.selection.empty && oldState.selection.$from.nodeAfter?.type.name === citationNode.name;

    // If the the cursor was before the opening bracket and is now after the bracket,
    // it means the user is trying to enter the node so we move the cursor inside
    if (wasAfterBeforeOpeningBracket && isAfterOpeningBracket) {
      tr.setSelection(TextSelection.create(tr.doc, $from.pos + 1));
    } else {
      // If there no text node in front of the citation node, create an "empty" one
      // Note: prosemirror does not support empty text node, so we have to create a node with a space
      if (isAfterOpeningBracket && !doc.resolve($from.before()).nodeBefore) {
        tr.insert($from.before(), schema.text(' '));
      }

      tr.setSelection(TextSelection.create(tr.doc, $from.pos - 1));
    }

    return tr;
  },
});

export const citationNode = Node.create({
  name: 'citation',

  content: '(text | reference)*',
  defining: true,
  group: 'inline',
  inline: true,
  selectable: true,

  parseHTML: () => [
    {
      tag: 'citation',
    },
  ],

  renderHTML: ({ HTMLAttributes }) => ['citation', HTMLAttributes, 0],

  addNodeView: () => ReactNodeViewRenderer(Citation, { attrs: { 'data-testid': 'citation' } }),

  addInputRules: () => [
    new InputRule({
      find: inputRegex,
      handler: squareBracketHandler,
    }),
  ],

  addKeyboardShortcuts: () => ({
    ArrowRight: arrowRight,
    Backspace: backspace,
    Enter: enter,
  }),

  addProseMirrorPlugins: () => [citationPlugin, moveCursorPlugin],
});
