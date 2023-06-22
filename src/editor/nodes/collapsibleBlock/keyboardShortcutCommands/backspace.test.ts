import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock } from '../../../test-fixtures';
import { findNodesByNodeType, getPrettyHTML, getText, setUpEditorWithSelection } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { backspace } from './backspace';

describe('Backspace keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
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
  });

  test('should turn collapsible block back into paragraphs when selection is at the beginning of the summary', () => {
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

    expect(getPrettyHTML(editor)).toMatchInlineSnapshot(`
      "<draggable-block><p>Header</p></draggable-block>
      <draggable-block><p>Content Line 1</p></draggable-block>
      <draggable-block><p>Content Line 2</p></draggable-block>"
    `);
  });

  test('should remove content and collapse block when removing the only remaining content block of collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block folded='false'>
          <collapsible-summary></collapsible-summary>
          <collapsible-content>
              <p></p>|
          </collapsible-content>
      </collapsible-block>`,
    );

    let [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();

    expect(collapsibleBlock.attrs.folded).toBe(false);
    expect(collapsibleBlock.childCount).toBe(2);

    const initialSummary = getText(collapsibleBlock.child(0));

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();

    expect(collapsibleBlock.attrs.folded).toBe(true);
    expect(collapsibleBlock.childCount).toBe(1);
    expect(getText(collapsibleBlock)).toEqual(initialSummary);
    expect(getPrettyHTML(editor)).toMatchInlineSnapshot(`
      "<draggable-block>
        <collapsible-block folded=\\"true\\">
          <collapsible-summary></collapsible-summary>
        </collapsible-block>
      </draggable-block>"
    `);
  });

  test('should not do anything when the selection is not at the beginning of the summary', () => {
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

  test('should not do anything when removing a content block that has siblings', () => {
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

  test('should not do anything when the selection is not in a collapsible block', () => {
    setUpEditorWithSelection(editor, `<p>So|me content</p>` + defaultCollapsibleBlock);
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when the selection is not empty', () => {
    editor.chain().setContent(defaultCollapsibleBlock).selectAll().run();
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
