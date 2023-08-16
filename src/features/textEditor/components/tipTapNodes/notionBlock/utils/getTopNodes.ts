import { Selection } from '@tiptap/pm/state';

import { NotionBlockNode } from '../NotionBlockNode';
import { NodeData } from './types';

/**
 * Given a selection, return the top nodes, ie. all partially or completely selected nodes, but not their children
 *
 * @param selection
 */
export function getTopNodes(selection: Selection): NodeData[] {
  const { $from, $to } = selection;
  const doc = $from.node(0);

  const topNodes: NodeData[] = [];
  doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
    if (node.type.name === NotionBlockNode.name) {
      topNodes.push({ node, resolvedPos: doc.resolve(pos) });
    }
    return false;
  });

  return topNodes;
}
