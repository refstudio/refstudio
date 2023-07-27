import { JSONContent } from '@tiptap/core';
import Document from '@tiptap/extension-document';

import { NotionBlockNode } from '../notionBlock/NotionBlockNode';

export const RefStudioDocument = Document.extend({
  content: 'notionBlock* | codeBlock',
});

export const EMPTY_DOCUMENT_CONTENT: JSONContent = {
  type: RefStudioDocument.name,
  content: [
    {
      type: NotionBlockNode.name,
      content: [{ type: 'paragraph' }],
    },
  ],
};
