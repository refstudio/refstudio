import { mergeAttributes, Node } from '@tiptap/core';

export const CollapsibleBlockContentNode = Node.create({
  name: 'collapsibleContent',
  group: 'block',
  content: 'draggableBlock+',

  parseHTML() {
    return [
      {
        tag: 'collapsible-content',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['collapsible-content', mergeAttributes(HTMLAttributes), 0];
  },
});
