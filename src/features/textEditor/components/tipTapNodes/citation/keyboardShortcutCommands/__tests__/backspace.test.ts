import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../../__tests__/test-utils';
import { backspace } from '../backspace';

describe('Backspace keyboard command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should remove the citation node and the "[" character back', () => {
    setUpEditorWithSelection(editor, `<p><citation>C|</citation></p>`);

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot('"<p>[|</p>"');
  });

  it('should block the event if the selection is not empty and starts in a citation node', () => {
    setUpEditorWithSelection(
      editor,
      `<p>Paragraph 1 <citation>Citation|</citation></p>
       <p>Paragraph 2|</p>`,
    );

    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should block the event if the selection is not empty and ends in a citation node', () => {
    setUpEditorWithSelection(
      editor,
      `<p>|Paragraph 1</p>
       <p>Paragraph 2 <citation>Citation|</citation></p>`,
    );

    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should not do anything if the removed character is not the last of the node', () => {
    setUpEditorWithSelection(editor, `<p><citation>Citation|</citation></p>`);

    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should not do anything if the selection is inside a same citation node', () => {
    setUpEditorWithSelection(editor, `<p><citation>Cit|ation|</citation></p>`);

    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should not do anything if the selection is not empty', () => {
    setUpEditorWithSelection(
      editor,
      `<p>Paragraph 1|<citation>Citation</citation></p>
       <p>Paragraph 2|</p>`,
    );

    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should not do anything if the cursor is not in a citation node', () => {
    setUpEditorWithSelection(editor, `<p>Paragraph 1|</p>`);

    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });
});
