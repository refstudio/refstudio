import Document from '@tiptap/extension-document';

import { unsetPartiallySelectedCollapsibleBlocks } from '../collapsibleBlock/helpers/unsetPartiallySelectedCollapsibleBlocks';
import { backspace } from './keyboardShortcutCommands/backspace';

export const RefStudioDocument = Document.extend({
  content: 'draggableBlock* | codeBlock',
  addKeyboardShortcuts() {
    return {
      Backspace: backspace,
    };
  },
  addCommands() {
    return {
      deleteSelection: () => (props) => {
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
