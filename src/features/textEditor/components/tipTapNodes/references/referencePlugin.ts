import Mention from '@tiptap/extension-mention';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { Reference } from './Reference';

export const referencePlugin = Mention.extend({
  name: 'reference',
  addNodeView: () => ReactNodeViewRenderer(Reference),
});
