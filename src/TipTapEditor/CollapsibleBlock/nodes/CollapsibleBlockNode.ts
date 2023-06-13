import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { CollapsibleBlock } from '../CollapsibleBlock';

export interface CollapsibleBlockNodeAttributes {
  folded: boolean;
}

export const CollapsibleBlockNode = Node.create({
  name: 'collapsibleBlock',
  group: 'block',
  content: 'collapsibleSummary collapsibleContent',

  parseHTML() {
    return [
      {
        tag: 'collapsible-block',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['collapsible-block', HTMLAttributes, 0];
  },

  addAttributes(): {
    [K in keyof CollapsibleBlockNodeAttributes]: {
      default: CollapsibleBlockNodeAttributes[K];
    };
  } {
    return {
      folded: {
        default: true,
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleBlock);
  },
});
