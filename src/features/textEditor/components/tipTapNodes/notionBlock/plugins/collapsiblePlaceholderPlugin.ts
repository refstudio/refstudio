import { EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { NotionBlockNode } from '../NotionBlockNode';

const collapsiblePlaceholderPluginKey = new PluginKey<DecorationSet>('collapsiblePlaceholders');
/** Plugin to add placeholders to empty collapsible blocks that are open */
export const collapsiblePlaceholderPlugin = new Plugin({
  key: collapsiblePlaceholderPluginKey,
  state: {
    init: (_config, state) => DecorationSet.create(state.doc, getCollapsiblePlaceholderDecorations(state)),
    apply: (tr, value, _oldState, newState) => {
      if (!tr.docChanged) {
        return value;
      }
      return DecorationSet.create(tr.doc, getCollapsiblePlaceholderDecorations(newState));
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

function getCollapsiblePlaceholderDecorations(state: EditorState): Decoration[] {
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name !== NotionBlockNode.name) {
      return false;
    }
    if (node.attrs.type !== 'collapsible') {
      return;
    }

    const isEmpty = node.childCount === 1;
    const isCollapsed = !!node.attrs.collapsed;
    if (isEmpty && !isCollapsed) {
      // Add the decoration after the paragraph (...|<notionBlock><p>...</p>... --> ...<notionBlock><p>...</p>|...)
      decorations.push(createEmptyCollapsiblePlaceholderWidget(pos + node.child(0).nodeSize + 1));
    }
  });
  return decorations;
}

function createEmptyCollapsiblePlaceholderWidget(pos: number) {
  return Decoration.widget(pos, () => {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = 'Empty collapsible. Click or drop blocks inside.';
    placeholder.style.color = 'rgb(var(--grayscale-60))';
    placeholder.classList.add('empty-collapsible-placeholder');

    return placeholder;
  });
}
