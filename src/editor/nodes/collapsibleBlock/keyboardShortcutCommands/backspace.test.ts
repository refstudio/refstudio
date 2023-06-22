import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock, uncollapsedCollapsibleBlockWithEmptyContent } from '../../../test-fixtures';
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
    // 7 is to position the caret in the content
    editor.chain().setContent(uncollapsedCollapsibleBlockWithEmptyContent).setTextSelection(7).run();

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
  });

  test('should not do anything when the selection is not at the beginning of the summary', () => {
    editor.chain().setContent(defaultCollapsibleBlock).setTextSelection(4).run();
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when removing a content block that has siblings', () => {
    const content = `
    <collapsible-block folded='false'>
      <collapsible-summary></collapsible-summary>
      <collapsible-content>
        <p></p>
        <p>A sibling with content</p>
      </collapsible-content>
    </collapsible-block>`;
    editor.chain().setContent(content).setTextSelection(7).run();
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when the selection is not in a collapsible block', () => {
    editor
      .chain()
      .setContent('<p>Some content</p>' + defaultCollapsibleBlock)
      .setTextSelection(2)
      .run();
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
