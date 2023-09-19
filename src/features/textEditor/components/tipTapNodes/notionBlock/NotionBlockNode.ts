import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { indent } from './commands/indent';
import { joinBackward } from './commands/joinBackward';
import { joinForward } from './commands/joinForward';
import { splitBlock } from './commands/splitBlock';
import { toggleCollapsed } from './commands/toggleCollapsed';
import { toggleOrderedList } from './commands/toggleOrderedList';
import { toggleUnorderedList } from './commands/toggleUnorderedList';
import { unindent } from './commands/unindent';
import { createNotionBlockInputRule } from './inputRuleHandlers/createNotionBlockInputRule';
import { NotionBlock } from './NotionBlock';
import { blockBrowsingPlugin } from './plugins/blockBrowsingPlugin';
import { collapsibleArrowsPlugin } from './plugins/collapsibleArrowPlugin';
import { collapsiblePlaceholderPlugin } from './plugins/collapsiblePlaceholderPlugin';
import { hideHandlePlugin } from './plugins/hideHandlePlugin';
import { orderedListPlugin } from './plugins/orderedListPlugin';
import { placeholderPlugin } from './plugins/placeholderPlugin';
import { unorderedListPlugin } from './plugins/unorderedListPlugin';
import { BlockSelection } from './selection/BlockSelection';
import { getNotionBlockParent } from './utils/getNotionBlockParent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notionBlock: {
      toggleUnorderedList: () => ReturnType;
      toggleOrderedList: () => ReturnType;
    };
  }
}

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
        parseHTML: (element) => element.getAttribute('type'),
        renderHTML: (attributes) => ({
          type: attributes.type as string,
        }),
      },
      collapsed: {
        default: null,
        parseHTML: (element) => element.getAttribute('collapsed') === 'true',
        renderHTML: (attributes) => ({
          collapsed: attributes.collapsed as boolean,
        }),
      },
    };
  },

  parseHTML: () => [{ tag: 'notionblock' }],

  renderHTML: ({ HTMLAttributes }) => ['notionblock', HTMLAttributes, 0],

  addNodeView: () => ReactNodeViewRenderer(NotionBlock),

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => editor.commands.command(indent),
      'Shift-Tab': ({ editor }) => editor.commands.command(unindent),
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        if (
          selection.empty &&
          selection.$from.parent.content.size === 0 &&
          selection.$from.node(-1).attrs.type !== null
        ) {
          return editor.commands.command(({ dispatch, tr }) => {
            if (dispatch) {
              tr.setNodeAttribute(selection.$from.before(-1), 'type', null);
              tr.setNodeAttribute(selection.$from.before(-1), 'collapsed', null);
              dispatch(tr);
            }
            return true;
          });
        }
        if (!selection.empty) {
          return editor.chain().command(joinBackward).command(splitBlock).run();
        }
        return editor.commands.command(splitBlock.bind(this));
      },
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        if (selection.empty && !editor.view.endOfTextblock('left')) {
          return false;
        }

        if (selection.empty) {
          const { $from } = selection;
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

          const isCollapsibleFirstChild =
            $from.depth > 2 && $from.node(-2).attrs.type === 'collapsible' && $from.indexAfter(-2) === 2;
          if (!isCollapsibleFirstChild && editor.can().command(unindent)) {
            return editor.commands.command(unindent);
          }
        }

        return editor.commands.command(joinBackward);
      },
      Delete: ({ editor }) => editor.commands.command(joinForward),
      'Cmd-Enter': ({ editor }) => {
        const { $from } = editor.state.selection;
        const notionBlock = getNotionBlockParent($from);
        if (!notionBlock) {
          return false;
        }
        return editor.commands.command(({ dispatch, tr, view }) =>
          toggleCollapsed({ pos: notionBlock.resolvedPos.pos, dispatch, tr, view }),
        );
      },
      'Mod-a': ({ editor }) => {
        const { selection } = editor.state;
        if (selection instanceof BlockSelection) {
          return false;
        }
        const fromParentBlock = getNotionBlockParent(selection.$from);
        const toParentBlock = getNotionBlockParent(selection.$to);
        if (!fromParentBlock || !toParentBlock) {
          return false;
        }
        const from = fromParentBlock.resolvedPos.pos + 2;
        const to = toParentBlock.resolvedPos.pos + toParentBlock.node.firstChild!.nodeSize;

        if (from !== selection.from || to !== selection.to) {
          return editor.commands.setTextSelection({ from, to });
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins: () => [
    blockBrowsingPlugin,
    collapsibleArrowsPlugin,
    collapsiblePlaceholderPlugin,
    hideHandlePlugin,
    orderedListPlugin,
    placeholderPlugin,
    unorderedListPlugin,
  ],

  addInputRules: () => [
    createNotionBlockInputRule(/^> $/, 'collapsible'),
    createNotionBlockInputRule(/^[-*] $/, 'unorderedList'),
    createNotionBlockInputRule(/^(\d+|\w+)\. $/, 'orderedList'),
  ],

  addCommands: () => ({
    toggleUnorderedList: () => toggleUnorderedList,
    toggleOrderedList: () => toggleOrderedList,
  }),
});
