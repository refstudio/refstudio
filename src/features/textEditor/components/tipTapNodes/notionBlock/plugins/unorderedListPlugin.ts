import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { NotionBlockNode } from '../NotionBlockNode';
import { getParent } from '../utils/getParent';

const LIST_STYLES = ['disc', 'circle', 'square'];

/** Plugin to add decorations to unordered list items */
function getUnorderedListDecorations(state: EditorState): Decoration[] {
  const decorations: Decoration[] = [];

  state.doc.descendants((node, pos) => {
    if (node.type.name === NotionBlockNode.name) {
      if (node.attrs.type === 'unorderedList' && node.childCount > 0) {
        let depth = 0;
        let parent = getParent(state.doc.resolve(pos));

        while (parent?.node.type.name === NotionBlockNode.name && parent.node.attrs.type === 'unorderedList') {
          depth++;
          parent = getParent(parent.resolvedPos);
        }

        const firstChild = node.child(0);
        decorations.push(
          Decoration.node(pos + 1, pos + firstChild.nodeSize + 1, {
            class: 'unordered-list-item ' + LIST_STYLES[depth % 3],
          }),
        );
      }
    } else {
      return false;
    }
  });

  return decorations;
}

const unorderedListPluginKey = new PluginKey<DecorationSet>('unorderedList');

export const unorderedListPlugin = new Plugin({
  key: unorderedListPluginKey,
  state: {
    init: (_config, state) => DecorationSet.create(state.doc, getUnorderedListDecorations(state)),
    apply: (tr, value, _oldState, newState) => {
      if (!tr.docChanged) {
        return value;
      }
      return DecorationSet.create(tr.doc, getUnorderedListDecorations(newState));
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
