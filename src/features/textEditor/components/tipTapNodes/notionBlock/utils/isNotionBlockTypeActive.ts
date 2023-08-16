import { Selection } from '@tiptap/pm/state';

import { getTopNodes } from './getTopNodes';

/**
 * Returns whether a given notion block type is active in selection.
 * A type is said to be active when all top nodes of the selection are of this type
 *
 * @param selection
 * @returns
 */
export function isNotionBlockTypeActive(selection: Selection, type: string): boolean {
  return getTopNodes(selection).every((nodeData) => nodeData.node.attrs.type === type);
}
