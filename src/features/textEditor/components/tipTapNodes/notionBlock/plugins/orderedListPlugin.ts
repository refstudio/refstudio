import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { NotionBlockNode } from '../NotionBlockNode';
import { getParent } from '../utils/getParent';
import { getPreviousSibling } from '../utils/getPreviousSibling';

const LIST_STYLES = ['decimal', 'alpha', 'roman'];

function getOrderedListDecorations(state: EditorState): Decoration[] {
  const decorations: Decoration[] = [];

  state.doc.descendants((node, pos) => {
    if (node.type.name === NotionBlockNode.name) {
      if (node.attrs.type === 'orderedList' && node.childCount > 0) {
        let depth = 0;
        let parent = getParent(state.doc.resolve(pos));

        while (parent?.node.type.name === NotionBlockNode.name && parent.node.attrs.type === 'orderedList') {
          depth++;
          parent = getParent(parent.resolvedPos);
        }

        let previousOrderedSiblings = 0;
        let sibling = getPreviousSibling(state.doc.resolve(pos));

        while (sibling?.node.type.name === NotionBlockNode.name && sibling.node.attrs.type === 'orderedList') {
          previousOrderedSiblings++;
          sibling = getPreviousSibling(sibling.resolvedPos);
        }

        const firstChild = node.child(0);
        decorations.push(
          Decoration.node(pos + 1, pos + firstChild.nodeSize + 1, {
            class: 'ordered-list-item ' + LIST_STYLES[depth % 3],
            style: `counter-reset: counter ${previousOrderedSiblings + 1}`,
          }),
        );
      }
    } else {
      return false;
    }
  });

  return decorations;
}

const orderedListPluginKey = new PluginKey<DecorationSet>('orderedList');

export const orderedListPlugin = new Plugin({
  key: orderedListPluginKey,
  state: {
    init: (_config, state) => DecorationSet.create(state.doc, getOrderedListDecorations(state)),
    apply: (tr, value, _oldState, newState) => {
      if (!tr.docChanged) {
        return value;
      }
      return DecorationSet.create(tr.doc, getOrderedListDecorations(newState));
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
