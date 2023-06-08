import Document from '@tiptap/extension-document';

export const RefStudioDocument = Document.extend({
  content: 'draggableBlock* | codeBlock',
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': ({ editor }) => {
        console.log(editor.getJSON());
        return true;
      },
    };
  },
});
