import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { indent } from './commands/indent';
import { joinBackward } from './commands/joinBackward';
import { joinForward } from './commands/joinForward';
import { splitBlock } from './commands/splitBlock';
import { unindent } from './commands/unindent';
import { NotionBlock } from './NotionBlock';

const placeholderPluginKey = new PluginKey<DecorationSet>('placeholder');
const placeholderPlugin = new Plugin({
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

const hideHandlePluginKey = new PluginKey<boolean>('hideHandle');
const hideHandlePlugin = new Plugin({
  key: hideHandlePluginKey,
  state: {
    init: () => false,
    apply: (tr, value) => {
      const metadata = tr.getMeta(hideHandlePluginKey) as boolean | undefined;
      if (metadata !== undefined) {
        return metadata;
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

export const NotionBlockNode = Node.create({
  name: 'notionBlock',
  content: 'block notionBlock*',
  defining: true,
  whitespace: 'pre',
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-type'),
        renderHTML: (attributes) => ({
          'data-type': attributes.type as string,
        }),
      },
    };
  },

  parseHTML: () => [{ tag: 'notionBlock' }],

  renderHTML: ({ HTMLAttributes }) => ['notionBlock', HTMLAttributes, 0],

  addNodeView: () => ReactNodeViewRenderer(NotionBlock),

  addKeyboardShortcuts: () => ({
    Tab: ({ editor }) => editor.commands.command(indent),
    Enter: ({ editor }) => editor.commands.command(splitBlock),
    Backspace: ({ editor }) => {
      if (!editor.state.selection.empty || !editor.view.endOfTextblock('left')) {
        return false;
      }

      if (editor.can().command(unindent)) {
        return editor.commands.command(unindent);
      }
      return editor.commands.command(joinBackward);
    },
    'Shift-Tab': ({ editor }) => editor.commands.command(unindent),
    Delete: ({ editor }) => editor.commands.command(joinForward),
  }),

  addProseMirrorPlugins: () => [placeholderPlugin, hideHandlePlugin],
});
