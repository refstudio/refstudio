import { Node } from '@tiptap/core';
import { mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';

import { DraggableBlock } from './DraggableBlock';

export const DraggableBlockNode = Node.create({
  name: 'draggableBlock',

  content: 'block',
  defining: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="draggable-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'draggable-block' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DraggableBlock);
  },
});
