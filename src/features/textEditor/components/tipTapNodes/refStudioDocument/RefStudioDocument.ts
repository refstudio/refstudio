import Document from '@tiptap/extension-document';

export const RefStudioDocument = Document.extend({
  content: 'notionBlock* | codeBlock',
});
