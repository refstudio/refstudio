import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock } from '../../../test-fixtures';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { backspace } from './backspace';

describe('Backspace keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should turn collapsible block back into paragraphs when selection is at the beginning of the summary', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block>
        <collapsible-summary>|Header</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<p>|Header</p>
      <p>Content Line 1</p>
      <p>Content Line 2</p>"
    `);
  });

  it('should remove content and collapse block when removing the only remaining content block of collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block folded='false'>
          <collapsible-summary>Summary</collapsible-summary>
          <collapsible-content>
              <p>|</p>
          </collapsible-content>
      </collapsible-block>`,
    );

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded=\\"true\\">
        <collapsible-summary>Summary|</collapsible-summary>
      </collapsible-block>"
    `);
  });

  it('should not do anything when the selection is not at the beginning of the summary', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block>
        <collapsible-summary>H|eader</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything when removing a content block that has siblings', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block>
        <collapsible-summary></collapsible-summary>
        <collapsible-content>
          <p>|</p>
          <p>A sibling with content</p>
        </collapsible-content>
      </collapsible-block>`,
    );
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything when the selection is not in a collapsible block', () => {
    setUpEditorWithSelection(editor, `<p>So|me content</p>` + defaultCollapsibleBlock);
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything when the selection is not empty', () => {
    editor.chain().setContent(defaultCollapsibleBlock).selectAll().run();
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
