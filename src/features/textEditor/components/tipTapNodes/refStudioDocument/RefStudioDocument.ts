import { JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { NotionBlockNode } from '../notionBlock/NotionBlockNode';
import { BlockSelection } from '../notionBlock/selection/BlockSelection';

const selectionPluginKey = new PluginKey<DecorationSet>('selection');
const selectionPlugin = new Plugin({
  key: selectionPluginKey,
  state: {
    init: () => DecorationSet.empty,
    apply: (tr, value, oldState, newState) => {
      // Only update the state when the selection changes
      if (oldState.selection.from === newState.selection.from && oldState.selection.to === newState.selection.to) {
        return value;
      }
      if (tr.selection.empty || tr.selection instanceof BlockSelection) {
        return DecorationSet.empty;
      }
      return DecorationSet.create(tr.doc, [
        Decoration.inline(tr.selection.from, tr.selection.to, { nodeName: 'span', class: 'selected' }),
      ]);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

export const RefStudioDocument = Document.extend({
  content: 'notionBlock+',
  addProseMirrorPlugins: () => [selectionPlugin],
  addKeyboardShortcuts: () => ({
    // Prevent focus behaviour when pressing Tab/Shift-Tab
    Tab: () => true,
    'Shift-Tab': () => true,
  }),
});

export const EMPTY_DOCUMENT_CONTENT: JSONContent = {
  type: RefStudioDocument.name,
  content: [
    {
      type: NotionBlockNode.name,
      content: [{ type: 'paragraph' }],
    },
  ],
};
