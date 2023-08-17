import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const placeholderPluginKey = new PluginKey<DecorationSet>('placeholder');
/** Plugin to add placeholders to empty paragraphs when they are selected */
export const placeholderPlugin = new Plugin({
  key: placeholderPluginKey,
  state: {
    init: () => DecorationSet.empty,
    apply: (tr) => {
      if (!tr.selection.empty) {
        return DecorationSet.empty;
      }
      if (tr.selection.$from.parent.type.name !== 'paragraph' || tr.selection.$from.parent.content.size > 0) {
        return DecorationSet.empty;
      }
      return DecorationSet.create(tr.doc, [
        Decoration.widget(
          tr.selection.from,
          () => {
            const t = document.createElement('span');
            t.innerHTML = 'You can start writing here';
            t.style.color = 'hsl(var(--color-muted))';
            return t;
          },
          { side: 1 },
        ),
      ]);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
