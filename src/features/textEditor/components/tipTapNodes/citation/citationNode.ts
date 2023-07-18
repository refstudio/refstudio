import { InputRule, Node } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { referenceNode } from '../references/referenceNode';
import { Citation } from './Citation';

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
    apply: (_tr, _value, _oldState, newState) => {
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
  appendTransaction: (_transactions, oldState, newState) => {
    if (!newState.selection.empty) {
      return;
    }

    const { tr } = newState;
    const oldPluginState = citationPluginKey.getState(oldState) as CitationPluginState;
    const newPluginState = citationPluginKey.getState(newState) as CitationPluginState;

    // If there was no decoration before the update or if there is one after the update, nothing to do
    if (!oldPluginState || newPluginState) {
      return;
    }

    const { $from } = newState.selection;
    const { parent } = $from;

    // If the selection after the update is not in the citation node, nothing to do
    if (parent.type.name !== citationNode.name || $from.pos !== $from.after() - 1) {
      return;
    }

    // Otherwise, it means, there was a decoration, then some text was added: we insert '; ' in the document
    tr.insertText('; ', oldPluginState);
    return tr;
  },

  props: {
    decorations(state) {
      const decorationPos = this.getState(state);
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

  addNodeView: () => ReactNodeViewRenderer(Citation),

  addInputRules() {
    return [
      new InputRule({
        find: inputRegex,
        handler: ({ state, range }) => {
          const { tr } = state;
          const start = range.from;

          // When inserting a citation node, also inserts a '@' character to open the reference selector
          tr.insert(start, this.type.create({}, state.schema.text('@'))).setSelection(
            TextSelection.create(tr.doc, state.selection.from + 2),
          );
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Enable escaping the citation node when pressing ArrowRight while being at the end of the node
      ArrowRight: ({ editor }) => {
        if (!editor.state.selection.empty) {
          return false;
        }

        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== this.type.name || $from.pos !== $from.after() - 1) {
          return false;
        }

        const resolvedAfterPos = editor.state.doc.resolve($from.after());
        const maybeNextNode = resolvedAfterPos.nodeAfter;
        const { tr } = editor.state;
        if (!maybeNextNode) {
          tr.insert(resolvedAfterPos.pos, editor.schema.text(' '));
        }
        tr.setSelection(TextSelection.create(tr.doc, $from.after() + 1));

        editor.view.dispatch(tr);
        return true;
      },
      // Enable escaping the citation node when pressing ArrowLeft while being at the start of the node
      ArrowLeft: ({ editor }) => {
        if (!editor.state.selection.empty) {
          return false;
        }

        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== this.type.name || $from.pos !== $from.before() + 1) {
          return false;
        }

        const resolvedBeforePos = editor.state.doc.resolve($from.before());
        const maybePreviousNode = resolvedBeforePos.nodeBefore;
        const { tr } = editor.state;
        if (!maybePreviousNode) {
          tr.insert(resolvedBeforePos.pos, editor.schema.text(' '));
        }
        tr.setSelection(TextSelection.create(tr.doc, $from.before()));

        editor.view.dispatch(tr);
        return true;
      },
      // Block Enter key when selection overlaps with a citation node
      Enter: ({ editor }) => {
        if (
          editor.state.selection.$from.parent.type.name === this.type.name ||
          editor.state.selection.$to.parent.type.name === this.type.name
        ) {
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins: () => [citationPlugin],
});
