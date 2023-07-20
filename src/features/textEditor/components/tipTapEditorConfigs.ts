import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { Fragment, Node, Slice } from '@tiptap/pm/model';
import { Extensions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import markdown from 'highlight.js/lib/languages/markdown';
import { lowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';

import { CitationNode } from './tipTapNodes/citation/CitationNode2';
import { CollapsibleBlockContentNode } from './tipTapNodes/collapsibleBlock/nodes/CollapsibleBlockContent';
import { CollapsibleBlockNode } from './tipTapNodes/collapsibleBlock/nodes/CollapsibleBlockNode';
import { CollapsibleBlockSummaryNode } from './tipTapNodes/collapsibleBlock/nodes/CollapsibleBlockSummary';
import { DraggableBlockNode } from './tipTapNodes/draggableBlock/DraggableBlockNode';
import { ReferenceNode } from './tipTapNodes/references/ReferenceNode2';
import { RefStudioDocument } from './tipTapNodes/refStudioDocument/RefStudioDocument';
import { SentenceCompletionExtension } from './tipTapNodes/sentenceCompletion/SentenceCompletion2';
lowlight.registerLanguage('markdown', markdown);

export const EDITOR_EXTENSIONS: Extensions = [
  Markdown,
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    blockquote: false,
    codeBlock: false,
    document: false,
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  // Custom extensions
  RefStudioDocument,
  DraggableBlockNode,
  CollapsibleBlockNode,
  CollapsibleBlockContentNode,
  CollapsibleBlockSummaryNode,
  CitationNode,
  ReferenceNode,
  SentenceCompletionExtension,
];

export function transformPasted(slice: Slice) {
  return new Slice(stripTransparentMarksFromFragment(slice.content), slice.openStart, slice.openEnd);
}

function stripTransparentMarksFromFragment(fragment: Fragment) {
  // The following code is basically a fragment.map but Fragment class is not iterable and does not have a map method
  // so we have to use this forEach loop instead
  const updatedNodes: Node[] = [];
  fragment.forEach((node) => {
    updatedNodes.push(node.mark(node.marks.filter((mark) => mark.attrs.color !== 'transparent')));
  });
  return Fragment.fromArray(updatedNodes);
}
