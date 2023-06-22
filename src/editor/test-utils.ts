import { Node } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { Editor, Predicate } from '@tiptap/react';
import { format } from 'prettier';

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
    .join('');
}

/**
 * Set both content and selection for an editor.
 *
 * The selection is determined by the position of the "|" character.
 * There must be either one or two of these.
 * With one, this sets the cursor position.
 * With two, it sets the start and end of the selection.
 *
 * @returns The text positions of the one or two "|" characters in the editor.
 */
export function setUpEditorWithSelection(editor: Editor, contentHTML: string) {
  editor.chain().setContent(contentHTML).run();
  const minPos = TextSelection.atStart(editor.state.doc).from;
  const maxPos = TextSelection.atEnd(editor.state.doc).to;

  const positions = [];
  for (let i = minPos; i <= maxPos; i++) {
    const text = editor.view.state.doc.textBetween(i, i + 1);
    if (text === '|') {
      positions.push(i - positions.length); // subtract the number of chars that will have been deleted
    }
  }
  expect(positions.length).toBeGreaterThanOrEqual(1);
  expect(positions.length).toBeLessThanOrEqual(2);
  editor
    .chain()
    .setContent(contentHTML.replaceAll('|', ''))
    .setTextSelection({ from: positions[0], to: positions[1] ?? positions[0] })
    .run();
  return positions;
}

/**
 * Get the editor content as HTML and format it with prettier.
 *
 * Note that this removes <draggable-block> nodes since these tend to add noise to the HTML.
 */
export function getPrettyHTML(editor: Editor) {
  let html = editor.getHTML();
  html = html.replaceAll('<draggable-block>', '');
  html = html.replaceAll('</draggable-block>', '');

  // Format with prettier. TipTap HTML has multiple root nodes, so we need to wrap with <html>...</html>
  const prettyHtml = format('<html>' + html + '</html>', {
    parser: 'html',
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
  });
  // Unwrap and shift everything left by two spaces (one indent level)
  return prettyHtml
    .replace(/^<html>/, '')
    .replace(/<\/html>\s*$/, '')
    .replace(/^ {2}/gm, '')
    .trim();
}

export function getFullText(editor: Editor): string {
  return editor.view.state.doc.textBetween(
    TextSelection.atStart(editor.state.doc).from,
    TextSelection.atEnd(editor.state.doc).to,
  );
}
