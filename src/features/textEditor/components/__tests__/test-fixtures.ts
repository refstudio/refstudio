import { JSONContent } from '@tiptap/core';

export const emptyParagraphContent: JSONContent = {
  type: 'doc',
  content: [{ type: 'notionBlock', content: [{ type: 'paragraph', content: [] }] }],
};

export function createTextContent(text: string): JSONContent {
  return {
    type: 'doc',
    content: [{ type: 'notionBlock', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] }],
  };
}
