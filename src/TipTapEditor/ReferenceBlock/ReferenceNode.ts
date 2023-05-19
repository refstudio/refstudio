import Mention from '@tiptap/extension-mention';
import { suggestion } from './suggestion';

export const ReferenceNode = Mention.configure({
  HTMLAttributes: {
    class: 'reference',
  },
  renderLabel({ node }) {
    return `[${node.attrs.label ?? node.attrs.id}]`;
  },
  suggestion,
});
