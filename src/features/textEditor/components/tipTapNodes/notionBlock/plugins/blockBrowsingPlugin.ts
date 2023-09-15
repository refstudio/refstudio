import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { BlockSelection } from '../selection/BlockSelection';
import { collapsibleArrowsPluginKey } from './collapsibleArrowPlugin';
import { hideHandlePluginKey } from './hideHandlePlugin';

interface BlockBrowsingPluginOnState {
  enabled: true;
  decorations: DecorationSet;
}
interface BlockBrowsingPluginOffState {
  enabled: false;
}

type BlockBrowsingPluginState = BlockBrowsingPluginOnState | BlockBrowsingPluginOffState;

export const blockBrowsingPluginKey = new PluginKey<BlockBrowsingPluginState>('blockBrowsing');
export const blockBrowsingPlugin = new Plugin<BlockBrowsingPluginState>({
  key: blockBrowsingPluginKey,
  state: {
    init: () => ({ enabled: false }),
    apply: (tr) => {
      const { selection } = tr;
      if (!(selection instanceof BlockSelection)) {
        return { enabled: false };
      }
      const decorations = DecorationSet.create(
        tr.doc,
        selection.selectedBlocksPos.map(({ from, to }) => Decoration.node(from, to, { class: 'selected' })),
      );

      return { enabled: true, decorations };
    },
  },
  filterTransaction: (tr, state) => {
    const pluginState = blockBrowsingPluginKey.getState(state);
    if (!pluginState?.enabled) {
      return true;
    }
    // Block every transaction except pointer events, collapsing/uncollapsing events, events dispatched by the plugin and events from hideHandlePlugin
    return (
      tr.docChanged ||
      !!tr.getMeta('pointer') ||
      !!tr.getMeta(blockBrowsingPluginKey) ||
      tr.getMeta(collapsibleArrowsPluginKey) !== undefined ||
      tr.getMeta(hideHandlePluginKey) !== undefined
    );
  },
  props: {
    decorations(state) {
      const pluginState = this.getState(state);
      if (pluginState?.enabled) {
        return pluginState.decorations;
      }
    },
    handleKeyDown(view, event) {
      const state = this.getState(view.state);
      const { selection, tr } = view.state;

      if (!state?.enabled) {
        if (event.code === 'Escape') {
          tr.setSelection(new BlockSelection(selection.$anchor, selection.$head));
          view.dispatch(tr);
        }
        return;
      }

      // This is not suppsoed to happen
      if (!(selection instanceof BlockSelection)) {
        console.error('Block browsing is enabled but no block is selected');
        return;
      }

      const selectedBlock = view.state.doc.nodeAt(selection.head)!;
      tr.setMeta(blockBrowsingPluginKey, true);

      switch (event.code) {
        case 'Enter':
        case 'Escape': {
          tr.setSelection(
            TextSelection.near(view.state.doc.resolve(selection.head + selectedBlock.firstChild!.nodeSize)),
          );
          view.dispatch(tr);
          return;
        }
        case 'ArrowDown': {
          if (!event.shiftKey) {
            selection.selectNextBlock(tr, (t) => view.dispatch(t));
          } else {
            selection.expandDown(tr, (t) => view.dispatch(t));
          }
          return;
        }
        case 'ArrowUp': {
          if (!event.shiftKey) {
            selection.selectPreviousBlock(tr, (t) => view.dispatch(t));
          } else {
            selection.expandUp(tr, (t) => view.dispatch(t));
          }
          return;
        }
        case 'ArrowLeft': {
          // If the block is not collapsed, collapse it
          if (selectedBlock.attrs.type === 'collapsible' && !selectedBlock.attrs.collapsed) {
            tr.setNodeAttribute(selection.head, 'collapsed', true);
            view.dispatch(tr);
          } else {
            // Otherwise select its parent
            selection.selectParentBlock(tr, (t) => view.dispatch(t));
          }
          return;
        }
        case 'ArrowRight': {
          // If the block is collapsed, uncollapse it
          if (selectedBlock.attrs.type === 'collapsible' && selectedBlock.attrs.collapsed) {
            tr.setNodeAttribute(selection.head, 'collapsed', false);
            view.dispatch(tr);
          } else {
            // Otherwise select its first child
            selection.selectChildBlock(tr, (t) => view.dispatch(t));
          }
          return;
        }
        case 'KeyA': {
          if (event.metaKey) {
            tr.setSelection(BlockSelection.all(view.state.doc));
            view.dispatch(tr);
          }
          break;
        }
      }
    },
  },
});
