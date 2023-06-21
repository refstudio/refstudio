import { Node } from '@tiptap/pm/model';
import { Predicate } from '@tiptap/react';

/**
 * Filters descendants of a given node with a given predicate
 *
 * @param node the parent node
 * @param predicate the predicate function to use to filter
 * @returns the array of the descendants of the given node, for which the predicate is true
 */
export function filterDescendants(node: Node, predicate: Predicate): Node[] {
  const nodes: Node[] = [];
  node.descendants((descendant) => {
    if (predicate(descendant)) {
      nodes.push(descendant);
    }
  });
  return nodes;
}

/**
 * Get child nodes of a given type
 *
 * @param node the parent node
 * @param nodeType the node type to filter on
 * @returns the array of the children of the given node that are of type nodeType
 */
export function findNodesByNodeType(node: Node, nodeType: string) {
  return filterDescendants(node, (descendant) => descendant.type.name === nodeType);
}

/**
 * Gets the text in a node
 *
 * @param node the node to get text from
 * @returns All text contained in the node and its children, concatenated in one string
 */
export function getText(node: Node) {
  return filterDescendants(node, (n) => n.isText)
    .map((textNode) => textNode.text!)
    .reduce((acc, current) => acc + current, '');
}
