import { ResolvedPos } from '@tiptap/pm/model';

import { NotionBlockNode } from '../NotionBlockNode';
import { NodeData } from './types';

/**
 * Returns the first NotionBlock parent of the node the given position points to,
 * along with the position pointing before the block
 *
 * @param resolvedPos
 */
export function getNotionBlockParent(resolvedPos: ResolvedPos, depth = resolvedPos.depth): NodeData | null {
  const node = resolvedPos.node(0).nodeAt(resolvedPos.pos);
  if (node?.type.name === NotionBlockNode.name) {
    return { node, resolvedPos };
  }
  let d = depth;
  while (d > 0 && resolvedPos.node(d).type.name !== NotionBlockNode.name) {
    d--;
  }
  if (d === 0) {
    return null;
  }

  const parentIndex = resolvedPos.indexAfter(d - 1) - 1;
  const parentPos = resolvedPos.posAtIndex(parentIndex, d - 1);

  return { node: resolvedPos.node(d), resolvedPos: resolvedPos.node(0).resolve(parentPos) };
}
