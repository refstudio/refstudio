import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { setUpEditorWithSelection } from '../../../__tests__/test-utils';
import { enter } from '../enter';

describe('Enter keyboard command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should block the event if cursor is in a citation', () => {
    setUpEditorWithSelection(editor, `<p><citation>Citation|</citation></p>`);

    const initialDoc = editor.state.doc;

    const commandResult = enter({ editor });
    expect(commandResult).toBe(true);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should block the event if the first position of selection is within a citation node', () => {
    setUpEditorWithSelection(
      editor,
      `<p>Paragraph 1 <citation>Citation|</citation>.</p>
       <p>Paragraph 2|</p>`,
    );

    const initialDoc = editor.state.doc;

    const commandResult = enter({ editor });
    expect(commandResult).toBe(true);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should block the event if the second position of selection is within a citation node', () => {
    setUpEditorWithSelection(
      editor,
      `<p>Paragraph 1|</p>
       <p>Paragraph 2 <citation>Citation|</citation></p>`,
    );

    const initialDoc = editor.state.doc;

    const commandResult = enter({ editor });
    expect(commandResult).toBe(true);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });

  it('should not block the event if citation node is entirely selected', () => {
    setUpEditorWithSelection(
      editor,
      `<p>Paragraph 1|</p>
       <p>Paragraph 2 <citation>Citation</citation>|</p>`,
    );

    const initialDoc = editor.state.doc;

    const commandResult = enter({ editor });
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toStrictEqual(initialDoc.toJSON());
  });
});
