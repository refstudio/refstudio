import Document from '@tiptap/extension-document';

import { unsetPartiallySelectedCollapsibleBlocks } from '../collapsibleBlock/helpers/unsetPartiallySelectedCollapsibleBlocks';
import { backspace } from './keyboardShortcutCommands/backspace';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    refStudioDocument: {
      deleteNonEmptySelection: () => ReturnType;
    };
  }
}

export const RefStudioDocument = Document.extend({
  content: 'notionBlock* | codeBlock',
  addKeyboardShortcuts: () => ({
    Backspace: backspace,
    Tab: () => true,
    'Shift-Tab': () => true,
    'Mod-l': ({ editor }) => {
      console.log(editor.state.selection.from);
      console.log(editor.getHTML());
      return true;
    },
  }),
  addCommands: () => ({
    deleteNonEmptySelection: () => (props) => {
      const { dispatch, tr } = props;
      if (dispatch) {
        unsetPartiallySelectedCollapsibleBlocks(props);
        tr.deleteSelection();
      }
      return true;
    },
  }),
});
