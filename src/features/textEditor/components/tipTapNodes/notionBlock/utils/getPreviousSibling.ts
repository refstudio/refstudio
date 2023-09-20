import { ResolvedPos } from '@tiptap/pm/model';

import { NotionBlockNode } from '../NotionBlockNode';
import { NodeData } from './types';

/**
 * Returns the resolved position of the previous sibling of the node the given position points to.
 *
 * @param resolvedPos
 */
export function getPreviousSibling(resolvedPos: ResolvedPos): NodeData | null {
  const { parent } = resolvedPos;
  const nodeIndex = resolvedPos.indexAfter();

  if (nodeIndex === 0 || (parent.type.name === NotionBlockNode.name && nodeIndex === 1)) {
    return null;
  }

  const previousSibling = resolvedPos.parent.child(nodeIndex - 1);
  const previousSiblingPos = resolvedPos.posAtIndex(nodeIndex - 1);

  return { node: previousSibling, resolvedPos: resolvedPos.node(0).resolve(previousSiblingPos) };
}
