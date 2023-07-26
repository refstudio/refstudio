import { createChainableState, Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../../__tests__/test-utils';
import { squareBracketHandler } from '../squareBracketHandler';

describe('Square bracket input rule handler', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });
  it('should remove "[" and insert a citation node', () => {
    setUpEditorWithSelection(editor, '<p>[|</p>');

    const { tr } = editor.state;
    const state = createChainableState({
      state: editor.state,
      transaction: tr,
    });
    squareBracketHandler({ state, range: { from: 2, to: 3 } });
    editor.view.dispatch(state.tr);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p><citation>@|</citation></p>
      </notionblock>"
    `);
  });
});
