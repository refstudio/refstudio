import { InputRule, Mark } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { referenceExtension } from './referenceExtension';

type CitationPluginState = [number, number][];

const inputRegex = /\[$/;

const citationPluginKey = new PluginKey('citationPlugin');

const citationPlugin = new Plugin<CitationPluginState>({
  key: citationPluginKey,

  state: {
    init: () => [],
    apply: (_tr, _value, _oldState, newState) => {
      const positions: CitationPluginState = [];

      newState.doc.descendants((node, pos) => {
        if (node.marks.find((mark) => mark.type.name === referencesMark.name)) {
          let start = pos;
          const end = pos + node.nodeSize;

          if (positions.length > 0) {
            const [prevStart, prevEnd] = positions[positions.length - 1];
            if (prevEnd === pos) {
              positions.pop();
              start = prevStart;
            }
          }
          positions.push([start, end]);

          // Don't descend in the node's descendants
          return false;
        }
      });

      return positions;
    },
  },

  appendTransaction: (_transactions, oldState, newState) => {
    const { tr } = newState;
    const oldPluginState = citationPluginKey.getState(oldState) as CitationPluginState;
    const newPluginState = citationPluginKey.getState(newState) as CitationPluginState;

    if (oldPluginState.length !== newPluginState.length) {
      return;
    }

    const updatedPosition = oldPluginState.find(([oldStart, oldEnd], index) => {
      const [newStart, newEnd] = newPluginState[index];
      return (
        oldStart === newStart &&
        oldEnd !== newEnd &&
        oldState.doc.nodeAt(oldEnd - 1)?.type.name === referenceExtension.name
      );
    });

    if (!updatedPosition) {
      return;
    }

    tr.insertText('; ', updatedPosition[1]);
    return tr;
  },

  props: {
    decorations(state) {
      const decorations: Decoration[] = [];

      const currentState = this.getState(state);
      if (!currentState) {
        return null;
      }
      currentState.forEach(([start, end]) => {
        decorations.push(
          Decoration.widget(
            start,
            () => {
              const parentNode = document.createElement('span');

              parentNode.innerHTML = '[';

              return parentNode;
            },
            {},
          ),
        );
        decorations.push(
          Decoration.widget(
            end,
            () => {
              const parentNode = document.createElement('span');

              parentNode.innerHTML = ']';

              return parentNode;
            },
            {
              side: 1,
            },
          ),
        );

        if (state.selection.to === end && state.doc.nodeAt(end - 1)?.type.name === referenceExtension.name) {
          decorations.push(
            Decoration.widget(
              state.selection.to,
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
          );
        }
      });

      return DecorationSet.create(state.doc, decorations);
    },
  },
});

export const referencesMark = Mark.create({
  name: 'referencesNode',

  exitable: true,

  parseHTML: () => [
    {
      tag: 'citation',
    },
  ],

  renderHTML: ({ HTMLAttributes }) => ['citation', HTMLAttributes, 0],

  addInputRules: () => [
    new InputRule({
      find: inputRegex,
      handler: ({ state, range }) => {
        const { tr } = state;
        const start = range.from;

        tr.insert(start, state.schema.text('@'));
      },
    }),
  ],

  addProseMirrorPlugins: () => [citationPlugin],
});
