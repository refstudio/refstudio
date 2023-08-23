import { Selection } from '@tiptap/pm/state';

import { NotionBlockNode } from '../NotionBlockNode';
import { NodeData } from './types';

/**
 * Given a selection, return the top-level nodes, ie. all partially or completely selected nodes, but not their children
 *
 * @param selection
 */
export function getTopLevelNodes(selection: Selection): NodeData[] {
  const { $from, to } = selection;
  const doc = $from.node(0);

  // Find the Notion Block $from points to
  let { depth } = $from;
  while (depth >= 0 && $from.node(depth).type.name !== NotionBlockNode.name) {
    depth--;
  }

  if (depth < 0) {
    return [];
  }

  let nodePos = $from.posAtIndex($from.indexAfter(depth - 1) - 1, depth - 1);

  const topNodes: NodeData[] = [];
  while (nodePos < to) {
    const node = doc.nodeAt(nodePos);
    if (!node) {
      nodePos += 1;
      continue;
    }

    topNodes.push({ node, resolvedPos: doc.resolve(nodePos) });
    nodePos += node.nodeSize;
  }

  return topNodes;
}
