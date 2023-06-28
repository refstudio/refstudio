import { mergeAttributes, Node } from '@tiptap/core';

export const CollapsibleBlockSummaryNode = Node.create({
  name: 'collapsibleSummary',

  group: 'block',

  content: 'text*',
  selectable: false,

  parseHTML: () => [
    {
      tag: 'collapsible-summary',
    },
  ],

  renderHTML: ({ HTMLAttributes }) => ['collapsible-summary', mergeAttributes(HTMLAttributes), 0],
});
