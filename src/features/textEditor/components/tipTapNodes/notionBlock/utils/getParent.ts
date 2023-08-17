import { Node, ResolvedPos } from '@tiptap/pm/model';

interface NodeData {
  resolvedPos: ResolvedPos;
  node: Node;
}

/**
 * Returns the parent of the node the given position points to, along with the position pointing before the parent
 *
 * @param resolvedPos
 */
export function getParent(resolvedPos: ResolvedPos): NodeData | null {
  const { parent } = resolvedPos;
  const { depth } = resolvedPos;

  if (depth === 0) {
    return null;
  }

  const parentIndex = resolvedPos.indexAfter(-1) - 1;
  const parentPos = resolvedPos.posAtIndex(parentIndex, -1);

  return { node: parent, resolvedPos: resolvedPos.node(0).resolve(parentPos) };
}
