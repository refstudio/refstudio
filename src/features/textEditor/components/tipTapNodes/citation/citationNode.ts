import { InputRule, Node } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { referenceNode } from '../references/referenceNode';
import { Citation } from './Citation';

type CitationPluginState = number | null;

const inputRegex = /\[$/;

const citationPluginKey = new PluginKey('citationPlugin');

const citationPlugin = new Plugin<CitationPluginState>({
  key: citationPluginKey,

  state: {
    init: () => null,
    apply: (_tr, _value, _oldState, newState) => {
      if (!newState.selection.empty) {
        return null;
      }

      const { $from } = newState.selection;

      if ($from.parent.type.name !== citationNode.name || $from.pos !== $from.after() - 1) {
        return null;
      }

      const { parent } = $from;

      if (parent.child(parent.childCount - 1).type.name !== referenceNode.name) {
        return null;
      }

      return newState.selection.from;
    },
  },

  appendTransaction: (_transactions, oldState, newState) => {
    if (!newState.selection.empty) {
      return;
    }

    const { tr } = newState;
    const oldPluginState = citationPluginKey.getState(oldState) as CitationPluginState;
    const newPluginState = citationPluginKey.getState(newState) as CitationPluginState;

    if (!oldPluginState || newPluginState) {
      return;
    }

    const { $from } = newState.selection;
    const { parent } = $from;

    if (parent.type.name !== citationNode.name || $from.pos !== $from.after() - 1) {
      return;
    }

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

          tr.insert(start, this.type.create({}, state.schema.text('@'))).setSelection(
            TextSelection.create(tr.doc, state.selection.from + 2),
          );
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
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
      Enter: ({ editor }) => {
        // Block Enter key when selection overlaps with a citation node
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
