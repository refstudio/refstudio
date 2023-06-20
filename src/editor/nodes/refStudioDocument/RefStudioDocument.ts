import Document from '@tiptap/extension-document';

import { backspace } from './keyboardShortcutCommands/backspace';

export const RefStudioDocument = Document.extend({
  content: 'draggableBlock* | codeBlock',
  addKeyboardShortcuts() {
    return {
      Backspace: backspace,
    };
  },
});
