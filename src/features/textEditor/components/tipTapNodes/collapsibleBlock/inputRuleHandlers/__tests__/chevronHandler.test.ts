import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../../test-utils';
import { chevronHandler } from '../chevronHandler';

describe('Chevron input rule handler', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });
  it('should remove "> " and turn paragraph into an uncollapsed and focused collapsible block', () => {
    setUpEditorWithSelection(editor, '<p>> |Some content</p>');

    chevronHandler({ can: () => editor.can(), chain: () => editor.chain(), range: { from: 2, to: 4 } });

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded='false'>
        <collapsible-summary>|Some content</collapsible-summary>
        <collapsible-content><p></p></collapsible-content>
      </collapsible-block>"
    `);
  });

  it('should do nothing when the block cannot be turned into a collapsible block', () => {
    setUpEditorWithSelection(editor, '<h1>> |Some content</h1>');
    const initialDoc = editor.state.doc;

    chevronHandler({ can: () => editor.can(), chain: () => editor.chain(), range: { from: 2, to: 4 } });

    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
