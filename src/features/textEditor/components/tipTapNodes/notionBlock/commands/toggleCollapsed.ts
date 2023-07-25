import { CommandProps } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

import { collapsiblePluginKey, NotionBlockNode } from '../NotionBlockNode';

export function toggleCollapsed({
  pos,
  view,
  dispatch,
  tr,
}: { pos: number } & Pick<CommandProps, 'view' | 'dispatch' | 'tr'>): boolean {
  const notionBlock = view.state.doc.nodeAt(pos);
  if (!notionBlock || notionBlock.type.name !== NotionBlockNode.name || notionBlock.attrs.type !== 'collapsible') {
    return false;
  }

  if (dispatch) {
    // If the intervals [from, to] and [contentStart, contentEnd] overlap,
    // ie. part of the content is selected
    const { from, to } = tr.selection;
    const contentStart = pos + notionBlock.child(0).nodeSize + 1; // Position after the paragraph
    const contentEnd = pos + notionBlock.nodeSize; // End of the notion block
    console.log(contentStart, contentEnd);
    if (from <= contentEnd && contentStart <= to) {
      tr.setSelection(TextSelection.near(tr.doc.resolve(contentStart), -1));
    }
    dispatch(tr.setMeta(collapsiblePluginKey, true).setNodeAttribute(pos, 'collapsed', !notionBlock.attrs.collapsed));
  }
  return true;
}
