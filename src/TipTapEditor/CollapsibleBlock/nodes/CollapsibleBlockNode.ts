import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { CollapsibleBlock } from '../CollapsibleBlock';

export interface CollapsibleBlockNodeAttributes {
  folded: boolean;
}

export const CollapsibleBlockNode = Node.create({
  name: 'collapsibleBlock',

  group: 'block',

  content: 'collapsibleSummary collapsibleContent',
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'collapsible-block',
      },
    ];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () =>
        this.editor
          .chain()
          .insertContentAt(this.editor.state.selection.head, {
            type: this.type.name,
          })
          .focus()
          .run(),
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['collapsible-block', mergeAttributes(HTMLAttributes), 0];
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
