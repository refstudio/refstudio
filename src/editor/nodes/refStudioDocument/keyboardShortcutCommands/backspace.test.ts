import { Editor } from '@tiptap/react';

import { defaultParagraph } from '../../../test-fixtures';
import { getPrettyHTMLWithSelection, getSelectedText, getText, setUpEditorWithSelection } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { backspace } from './backspace';

describe('Backspace keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  test('should turn collapsible block back into paragraphs when selection is at the beginning of the summary', () => {
    setUpEditorWithSelection(editor, `<p>Some content</p><p>|Some content</p>`);
    expect(editor.state.doc.childCount).toBe(2);

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    // Paragraphs should have been merged together
    expect(editor.state.doc.childCount).toBe(1);

    expect(getText(editor.state.doc)).toEqual('Some contentSome content');
  });

  test('should unset partially selected collapsible blocks before deleting content', () => {
    setUpEditorWithSelection(
      editor,
      `<p>Some |content</p>
      <collapsible-block>
        <collapsible-summary>Header</collapsible-summary>
        <collapsible-content>
            <p>C|ontent Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>
      <collapsible-block>
        <collapsible-summary>Header</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>
      `,
    );
    expect(editor.state.doc.childCount).toBe(3);

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    // A new collapsible should have been added
    expect(editor.state.doc.childCount).toBe(3);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<p>Some |ontent Line 1</p>
      <p>Content Line 2</p>
      <collapsible-block folded=\\"true\\">
        <collapsible-summary>Header</collapsible-summary>
        <collapsible-content>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>"
    `);
  });

  test('should not do anything when the selection is empty and not a the beginning of a block', () => {
    setUpEditorWithSelection(editor, `<p>Some content</p><p>S|ome content</p>`);
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when the selection is a node selection', () => {
    editor
      .chain()
      .setContent(defaultParagraph + defaultParagraph)
      // 18 is the beginning of the second paragraph
      .setNodeSelection(18)
      .run();
    const initialDoc = editor.state.doc;
    expect(getSelectedText(editor)).toEqual('Some content');

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
