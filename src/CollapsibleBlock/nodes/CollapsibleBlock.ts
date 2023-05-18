import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CollapsibleBlock } from '../CollapsibleBlock';


export const CollapsibleBlockNode = Node.create({
  name: 'collapsibleBlock',

  group: 'block',

  content: 'collapsibleSummary collapsibleContent?',
  draggable:true,

  parseHTML() {
    return [
      {
        tag: 'collapsible-block',
      },
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        return this.editor.chain().insertContentAt(this.editor.state.selection.head, { type: this.type.name }).focus().run()
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['collapsible-block', mergeAttributes(HTMLAttributes), 0]
  },

  addAttributes() {
    return {
      folded: {
        default: true,
      }
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollapsibleBlock)
  },
})