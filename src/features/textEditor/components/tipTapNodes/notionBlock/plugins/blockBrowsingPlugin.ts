import { Fragment, Slice } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { ReplaceAroundStep } from '@tiptap/pm/transform';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { addUnindentSteps } from '../commands/unindent';
import { NotionBlockNode } from '../NotionBlockNode';
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
          if (event.shiftKey && event.metaKey) {
            // Cmd+Shift+Down: Move selected blocks down
            const indexInParent = selection.$to.indexAfter();
            const { parent } = selection.$to;
            const depthDifference = selection.$from.depth - selection.$to.depth;
            const endPos = selection.to + tr.doc.nodeAt(selection.to)!.nodeSize; // end of selection
            const selectionRange = selection.to - selection.from - depthDifference;

            if (endPos === tr.doc.content.size) {
              return;
            }

            // Bring the first nodes back to the same level as other nodes if needed
            if (selection.$from.depth > selection.$to.depth) {
              const blocksToUnindent = selection.selectedBlocksPos
                .filter(({ from }) => tr.doc.resolve(from).depth > selection.$to.depth)
                .reverse();

              for (const block of blocksToUnindent) {
                for (let i = 0; i < tr.doc.resolve(block.from).depth - selection.$to.depth; i++) {
                  addUnindentSteps(tr, tr.mapping.map(block.from + 2));
                }
              }
            }

            // If the last selected node has a sibling
            if (indexInParent < parent.childCount - 1) {
              const sibling = parent.child(indexInParent + 1);
              // If the sibling is collapsed, move selection after the sibling
              if (sibling.attrs.type === 'collapsible' && sibling.attrs.collapsed) {
                const sliceToMove = tr.doc.slice(selection.from + depthDifference, endPos);

                tr.delete(selection.from + depthDifference, endPos);

                const siblingEndPos = tr.mapping.map(endPos + sibling.nodeSize);
                tr.replace(siblingEndPos, siblingEndPos, sliceToMove);

                if (selection.from === selection.anchor) {
                  tr.setSelection(
                    new BlockSelection(tr.doc.resolve(siblingEndPos), tr.doc.resolve(siblingEndPos + selectionRange)),
                  );
                } else {
                  tr.setSelection(
                    new BlockSelection(tr.doc.resolve(siblingEndPos + selectionRange), tr.doc.resolve(siblingEndPos)),
                  );
                }
              } else {
                // If the sibling is uncollapsed, make selected blocks its child
                const sliceToMove = tr.doc.slice(selection.from + depthDifference, endPos);

                tr.delete(selection.from + depthDifference, endPos);
                const insertPos = tr.mapping.map(endPos + 1 + sibling.child(0)!.nodeSize);
                tr.replace(insertPos, insertPos, sliceToMove);

                if (selection.from === selection.anchor) {
                  tr.setSelection(
                    new BlockSelection(tr.doc.resolve(insertPos), tr.doc.resolve(insertPos + selectionRange)),
                  );
                } else {
                  tr.setSelection(
                    new BlockSelection(tr.doc.resolve(insertPos + selectionRange), tr.doc.resolve(insertPos)),
                  );
                }
              }
            } else if (selection.$to.depth > 0) {
              // If the selected block has no sibling, unindent it
              let fragment = Fragment.from(parent.copy());
              for (let i = 0; i < depthDifference; i++) {
                fragment = Fragment.from(parent.copy(fragment));
              }
              tr.step(
                new ReplaceAroundStep(
                  selection.from,
                  endPos + 1,
                  selection.from + depthDifference,
                  endPos,
                  new Slice(fragment, depthDifference + 1, 0),
                  depthDifference + 1,
                ),
              );
            }

            view.dispatch(tr);
          } else if (event.shiftKey) {
            // Shift+Down: Expand selection down
            selection.expandDown(tr, (t) => view.dispatch(t));
          } else {
            // Down: Select next block
            selection.selectNextBlock(tr, (t) => view.dispatch(t));
          }
          return;
        }
        case 'ArrowUp': {
          if (event.shiftKey && event.metaKey) {
            // Cmd+Shift+Up: Move selected blocks up
            const indexInParent = selection.$from.indexAfter();
            const { parent } = selection.$from;
            const depthDifference = selection.$from.depth - selection.$to.depth;
            const endPos = selection.to + tr.doc.nodeAt(selection.to)!.nodeSize; // end of selection
            const selectionRange = selection.to - selection.from - depthDifference;

            // Bring the first nodes back to the same level as other nodes if needed
            if (selection.$from.depth > selection.$to.depth) {
              const blocksToUnindent = selection.selectedBlocksPos
                .filter(({ from }) => tr.doc.resolve(from).depth > selection.$to.depth)
                .reverse();

              for (const block of blocksToUnindent) {
                for (let i = 0; i < tr.doc.resolve(block.from).depth - selection.$to.depth; i++) {
                  addUnindentSteps(tr, tr.mapping.map(block.from + 2));
                }
              }
            }

            if (
              indexInParent > 0 &&
              // For NotionBlockNodes, the first child is an inline block so the index must be greater than 1
              (parent.type.name !== NotionBlockNode.name || indexInParent > 1)
            ) {
              const siblingPos = selection.$from.posAtIndex(indexInParent - 1);
              const sibling = tr.doc.nodeAt(siblingPos);

              if (sibling?.attrs.type === 'collapsible' && sibling.attrs.collapsed) {
                // If the sibling is collapsed, move the block before its sibling
                const sliceToMove = tr.doc.slice(selection.from + depthDifference, endPos);
                tr.replace(selection.from + depthDifference, endPos);
                tr.replace(siblingPos, siblingPos, sliceToMove);

                if (selection.from === selection.anchor) {
                  tr.setSelection(
                    new BlockSelection(tr.doc.resolve(siblingPos), tr.doc.resolve(siblingPos + selectionRange)),
                  );
                } else {
                  tr.setSelection(
                    new BlockSelection(tr.doc.resolve(siblingPos + selectionRange), tr.doc.resolve(siblingPos)),
                  );
                }
              } else {
                // Otherwise, make the block a child of its sibling
                const startPos = selection.from - 1; // End of sibling

                let fragment = Fragment.from(selectedBlock.copy());
                for (let i = 0; i < depthDifference; i++) {
                  fragment = Fragment.from(selectedBlock.copy(fragment));
                }
                tr.step(
                  new ReplaceAroundStep(
                    startPos,
                    endPos,
                    selection.from + depthDifference,
                    endPos,
                    new Slice(fragment, depthDifference + 1, 0),
                    0,
                  ),
                );
              }
            } else if (parent.type.name === NotionBlockNode.name) {
              // Otherwise, move block before its parent.
              // NB: ProseMirror does not support moving content across other content,
              // so this transaction will not work well in collaborative editing

              const indexInGrandparent = selection.$from.indexAfter(-1) - 1;
              const parentStartPos = selection.$from.posAtIndex(indexInGrandparent, -1);

              // If this slice is edited by someone else, changes will be overriden in collaborative editing
              const sliceToMove = tr.doc.slice(selection.from + depthDifference, endPos);

              // Remove selection
              tr.replace(selection.from + depthDifference, endPos);

              // Add it before the parent
              tr.replace(parentStartPos, parentStartPos, sliceToMove);

              // Properly set selection
              if (selection.from === selection.anchor) {
                tr.setSelection(
                  new BlockSelection(tr.doc.resolve(parentStartPos), tr.doc.resolve(parentStartPos + selectionRange)),
                );
              } else {
                tr.setSelection(
                  new BlockSelection(tr.doc.resolve(parentStartPos + selectionRange), tr.doc.resolve(parentStartPos)),
                );
              }
            }
            view.dispatch(tr);
          } else if (event.shiftKey) {
            // Shift+Up: Expand selection up
            selection.expandUp(tr, (t) => view.dispatch(t));
          } else {
            // Up: Select previous block
            selection.selectPreviousBlock(tr, (t) => view.dispatch(t));
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
          if (selectedBlock.attrs.type === 'collapsible' && selectedBlock.attrs.collapsed) {
            // If the block is collapsed, uncollapse it
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
