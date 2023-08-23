import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const hideHandlePluginKey = new PluginKey<boolean>('hideHandle');
export const hideHandlePlugin = new Plugin({
  key: hideHandlePluginKey,
  state: {
    init: () => false,
    apply: (tr, value) => {
      const metadata = tr.getMeta(hideHandlePluginKey) as boolean | undefined;
      if (metadata !== undefined) {
        return metadata;
      }
      if (!value) {
        return tr.docChanged;
      }
      return value;
    },
  },
  props: {
    handleKeyPress(view) {
      if (!this.getState(view.state)) {
        const { tr } = view.state;
        tr.setMeta(hideHandlePluginKey, true);
        view.dispatch(tr);
      }
    },
    handleDOMEvents: {
      mousemove(view, event) {
        if (this.getState(view.state) && (event.movementX || event.movementY)) {
          const { tr } = view.state;
          tr.setMeta(hideHandlePluginKey, false);
          view.dispatch(tr);
        }
      },
    },
    decorations(state) {
      if (!this.getState(state)) {
        return DecorationSet.empty;
      }
      const decorations: Decoration[] = [];
      state.doc.forEach((node, offset) => {
        decorations.push(Decoration.node(offset, offset + node.nodeSize, { class: 'hidden-drag-handle' }));
      });
      return DecorationSet.create(state.doc, decorations);
    },
  },
});
