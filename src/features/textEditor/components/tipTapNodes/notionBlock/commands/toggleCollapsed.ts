import { CommandProps } from '@tiptap/core';

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
    dispatch(tr.setMeta(collapsiblePluginKey, true).setNodeAttribute(pos, 'collapsed', !notionBlock.attrs.collapsed));
  }
  return true;
}
