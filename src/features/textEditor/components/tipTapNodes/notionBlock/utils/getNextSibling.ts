import { ResolvedPos } from '@tiptap/pm/model';

import { NodeData } from './types';

/**
 * Returns the resolved position of the next sibling of the node the given position points to.
 *
 * @param resolvedPos
 */
export function getNextSibling(resolvedPos: ResolvedPos): NodeData | null {
  const { parent } = resolvedPos;
  const nodeIndex = resolvedPos.indexAfter();

  if (nodeIndex === parent.childCount - 1) {
    return null;
  }

  const nextSibling = resolvedPos.parent.child(nodeIndex + 1);
  const nextSiblingPos = resolvedPos.posAtIndex(nodeIndex + 1);

  return { node: nextSibling, resolvedPos: resolvedPos.node(0).resolve(nextSiblingPos) };
}
