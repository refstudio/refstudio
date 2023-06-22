import { Editor } from '@tiptap/react';

import { getSelectedText, setUpEditorWithSelection } from './test-utils';
import { EDITOR_EXTENSIONS } from './TipTapEditorConfigs';

describe('TipTap test utils', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  describe('setUpEditorWithSelection', () => {
    it('should position the cursor based on a marker', () => {
      const pos = setUpEditorWithSelection(editor, `<p>This |is some text content.</p>`);
      expect(pos).toEqual([7]);
      expect(editor.view.state.doc.textBetween(pos[0], pos[0] + 2)).toEqual('is');
      expect(getSelectedText(editor)).toEqual('');
    });

    it('should select text based on markers', () => {
      const [from, to] = setUpEditorWithSelection(
        editor,
        `<collapsible-block>
          <collapsible-summary>He|ader|</collapsible-summary>
          <collapsible-content>
              <p>Content Line 1</p>
              <p>Content Line 2</p>
          </collapsible-content>
        </collapsible-block>`,
      );
      const sel = editor.view.state.selection;
      const text = editor.view.state.doc.textBetween(sel.from, sel.to);
      expect(sel.from).toEqual(from);
      expect(sel.to).toEqual(to);
      expect(text).toEqual('ader');

      expect(getSelectedText(editor)).toEqual('ader');
    });
  });
});
