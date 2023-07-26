import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../../__tests__/test-utils';
import { arrowRight } from '../arrowRight';

describe('ArrowRight keyboard command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should exit the citation node', () => {
    setUpEditorWithSelection(editor, `<p><citation>Citation|</citation> Text after citation</p>`);

    const commandResult = arrowRight({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p>
          <citation>Citation</citation>
          |Text after citation
        </p>
      </notionblock>"
    `);
  });

  it('should create a text node after the citation and exit the citation node', () => {
    setUpEditorWithSelection(editor, `<p><citation>Citation|</citation></p>`);

    const commandResult = arrowRight({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<notionblock>
        <p>
          <citation>Citation</citation>
          |
        </p>
      </notionblock>"
    `);
  });

  it('should not do anything if the selection is not empty', () => {
    setUpEditorWithSelection(editor, `<p><citation>|Citation|</citation></p>`);

    const initialDoc = editor.state.doc;

    const commandResult = arrowRight({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should not do anything if the selection is not at the end of the node', () => {
    setUpEditorWithSelection(editor, `<p><citation>Citatio|n</citation></p>`);

    const initialDoc = editor.state.doc;

    const commandResult = arrowRight({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should not do anything if the selection is not in a citation node', () => {
    setUpEditorWithSelection(editor, `<p>Citation|</p>`);

    const initialDoc = editor.state.doc;

    const commandResult = arrowRight({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });
});
