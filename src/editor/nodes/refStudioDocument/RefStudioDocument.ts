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
  content: 'draggableBlock* | codeBlock',
  addKeyboardShortcuts() {
    return {
      Backspace: backspace,
      'Mod-l': ({ editor }) => {
        console.log(editor.getJSON());
        console.log(editor.state.selection);
        return true;
      },
    };
  },
  addCommands() {
    return {
      deleteNonEmptySelection: () => (props) => {
        const { dispatch, tr } = props;
        if (dispatch) {
          unsetPartiallySelectedCollapsibleBlocks(props);
          tr.deleteSelection();
        }
        return true;
      },
    };
  },
});
