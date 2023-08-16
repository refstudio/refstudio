import { JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { NotionBlockNode } from '../notionBlock/NotionBlockNode';

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
      if (tr.selection.empty) {
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
  content: 'notionBlock* | codeBlock',
  addKeyboardShortcuts: () => ({
    'Mod-l': ({ editor }) => {
      const { from } = editor.state.selection;
      console.log(from);
      console.log(editor.getHTML());
      // console.log(getPreviousSiblingOrParent(editor.state.doc.resolve(from - 2)));
      return true;
    },
  }),
  addProseMirrorPlugins: () => [selectionPlugin],
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
