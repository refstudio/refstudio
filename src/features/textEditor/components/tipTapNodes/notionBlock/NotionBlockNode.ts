import { InputRule, Node } from '@tiptap/core';
import { EditorState, Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Decoration, DecorationSet } from 'prosemirror-view';

import { indent } from './commands/indent';
import { joinBackward } from './commands/joinBackward';
import { joinForward } from './commands/joinForward';
import { splitBlock } from './commands/splitBlock';
import { toggleCollapsed } from './commands/toggleCollapsed';
import { unindent } from './commands/unindent';
import { chevronHandler } from './inputRuleHandlers/chevronHandler';
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

function createCollapsibleArrowButtonWidget(pos: number, isEmpty: boolean) {
  return Decoration.widget(
    pos,
    () => {
      const button = document.createElement('button');
      button.classList.add('collapsible-arrow');
      button.innerHTML = `
        <svg className="triangle" viewBox="0 0 100 100">
          <polygon points="5.9,88.2 50,11.8 94.1,88.2 " />
        </svg>`;

      if (isEmpty) {
        button.classList.add('empty');
      }

      return button;
    },
    { side: -1 },
  );
}

function getCollapsibleArrowDecorations(state: EditorState): Decoration[] {
  const decorations: Decoration[] = [];
  state.doc.descendants((node, pos) => {
    if (node.type.name !== NotionBlockNode.name) {
      return false;
    }
    if (node.attrs.type !== 'collapsible') {
      return;
    }

    const isEmpty = node.childCount === 1;
    // + 2 to add the decoration in the paragraph (...|<notionBlock><p>... --> ...<notionBlock><p>|...)
    decorations.push(createCollapsibleArrowButtonWidget(pos + 2, isEmpty));
  });
  return decorations;
}

function createEmptyCollapsiblePlaceholderWidget(pos: number) {
  return Decoration.widget(pos, () => {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = 'Empty toggle. Click or drop blocks inside.';
    placeholder.style.color = 'hsl(var(--color-muted))';
    placeholder.classList.add('empty-collapsible-placeholder');

    return placeholder;
  });
}

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

export const collapsiblePluginKey = new PluginKey<DecorationSet>('collapsibleNodes');
const collapsiblePlugin = new Plugin({
  key: collapsiblePluginKey,
  state: {
    init: (_config, state) => DecorationSet.create(state.doc, getCollapsibleArrowDecorations(state)),
    apply: (tr, value, _oldState, newState) => {
      if (!tr.docChanged || tr.getMeta(collapsiblePluginKey)) {
        return value;
      }
      return DecorationSet.create(tr.doc, getCollapsibleArrowDecorations(newState));
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
    handleClick: (view, pos, event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const toggleNodeCollapsed = () =>
        toggleCollapsed({ pos: pos - 2, view, tr: view.state.tr, dispatch: (tr: Transaction) => view.dispatch(tr) });
      // We need this because user can click on the svg polygon element, that is not an instance of HTMLElement
      if (target.parentElement?.parentElement?.className.includes('collapsible-arrow')) {
        toggleNodeCollapsed();
      } else if (target.parentElement?.className.includes('collapsible-arrow')) {
        toggleNodeCollapsed();
      } else if (target.className.includes('collapsible-arrow')) {
        toggleNodeCollapsed();
      } else if (target.className.includes('empty-collapsible-placeholder')) {
        const { tr } = view.state;
        const schemaNodes = view.state.schema.nodes;
        view.dispatch(tr.insert(pos, schemaNodes[NotionBlockNode.name].create(null, schemaNodes.paragraph.create())));
      }
    },
  },
});
export const collapsiblePlaceholderPluginKey = new PluginKey<DecorationSet>('collapsibleNodes');
const collapsiblePlaceholderPlugin = new Plugin({
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

export const NotionBlockNode = Node.create({
  name: 'notionBlock',
  content: 'block notionBlock*',
  group: 'block',
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
      collapsed: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-collapsed') === 'true',
        renderHTML: (attributes) => ({
          'data-collapsed': attributes.collapsed as boolean,
        }),
      },
    };
  },

  parseHTML: () => [{ tag: 'notionBlock' }],

  renderHTML: ({ HTMLAttributes }) => ['notionBlock', HTMLAttributes, 0],

  addNodeView: () => ReactNodeViewRenderer(NotionBlock),

  addKeyboardShortcuts: () => ({
    Tab: ({ editor }) => editor.commands.command(indent),
    Enter: ({ editor }) => {
      if (!editor.state.selection.empty) {
        return editor.chain().command(joinBackward).command(splitBlock).run();
      }
      return editor.commands.command(splitBlock);
    },
    Backspace: ({ editor }) => {
      if (!editor.state.selection.empty) {
        return editor.commands.command(joinBackward);
      }

      const { $from } = editor.state.selection;
      const notionBlockNode = $from.node(-1);
      if (notionBlockNode.attrs.type !== null) {
        return editor.commands.command(({ dispatch, tr }) => {
          if (dispatch) {
            tr.setNodeAttribute($from.before(-1), 'type', null);
            tr.setNodeAttribute($from.before(-1), 'collapsed', null);
            dispatch(tr);
          }
          return true;
        });
      }

      if (editor.can().command(unindent)) {
        return editor.commands.command(unindent);
      }
      return editor.commands.command(joinBackward);
    },
    'Shift-Tab': ({ editor }) => editor.commands.command(unindent),
    Delete: ({ editor }) => editor.commands.command(joinForward),
    'Cmd-Enter': ({ editor }) => {
      const { $from } = editor.state.selection;
      if ($from.node(-1).type.name !== NotionBlockNode.name || $from.node(-1).attrs.type !== 'collapsible') {
        return false;
      }
      const pos = $from.before(-1);
      return editor.commands.command(({ dispatch, tr, view }) => toggleCollapsed({ pos, dispatch, tr, view }));
    },
  }),

  addProseMirrorPlugins: () => [placeholderPlugin, hideHandlePlugin, collapsiblePlugin, collapsiblePlaceholderPlugin],

  addInputRules() {
    return [
      new InputRule({
        find: /^> $/,
        handler: chevronHandler.bind(this),
      }),
    ];
  },
});
