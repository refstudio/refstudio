import { mergeAttributes, Node } from '@tiptap/core';

export const CollapsibleBlockSummaryNode = Node.create({
  name: 'collapsibleSummary',

  group: 'block',

  content: 'text*',
  selectable: false,

  parseHTML() {
    return [
      {
        tag: 'collapsible-summary',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['collapsible-summary', mergeAttributes(HTMLAttributes), 0];
  },
});