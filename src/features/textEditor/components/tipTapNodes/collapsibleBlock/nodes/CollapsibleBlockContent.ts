import { mergeAttributes, Node } from '@tiptap/core';

export const CollapsibleBlockContentNode = Node.create({
  name: 'collapsibleContent',
  group: 'block',
  content: 'draggableBlock+',
  defining: true,
  selectable: false,

  parseHTML: () => [
    {
      tag: 'collapsible-content',
    },
  ],

  renderHTML: ({ HTMLAttributes }) => ['collapsible-content', mergeAttributes(HTMLAttributes), 0],
});
