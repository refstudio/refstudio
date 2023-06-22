import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock, uncollapsedCollapsibleBlockWithEmptyContent } from '../../../test-fixtures';
import { findNodesByNodeType, getText } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { backspace } from './backspace';

const collapsibleBlockWithSelection = `
<collapsible-block>
    <collapsible-summary>He|ader|</collapsible-summary>
    <collapsible-content>
        <p>Content Line 1</p>
        <p>Content Line 2</p>
    </collapsible-content>
</collapsible-block>`;

function setUpEditorWithSelection(editor: Editor, content: string) {
  editor.chain().setContent(content).run();
  const docLength = editor.getText().length;
  const positions = [];
  for (let i = 0; i < docLength; i++) {
    const text = editor.view.state.doc.textBetween(i, i + 1);
    if (text === '|') {
      positions.push(i - positions.length);
    }
  }
  expect(positions.length).toBeGreaterThanOrEqual(1);
  expect(positions.length).toBeLessThanOrEqual(2);
  editor
    .chain()
    .setContent(content.replaceAll('|', ''))
    .setTextSelection(positions.length > 1 ? { from: positions[0], to: positions[1] } : positions[0])
    .run();
  return positions;
}

describe('Backspace keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should select text based on markers', () => {
    const [from, to] = setUpEditorWithSelection(editor, collapsibleBlockWithSelection);
    console.log(from, to);
    editor.chain().setTextSelection({ from, to }).run();

    const sel = editor.view.state.selection;
    const text = editor.view.state.doc.textBetween(sel.from, sel.to);
    expect(sel.from).toEqual(from);
    expect(sel.to).toEqual(to);
    expect(text).toEqual('ader');
  });

  test('should turn collapsible block back into paragraphs when selection is at the beginning of the summary', () => {
    // 3 is to position the caret at the beginning of the summary
    // editor.chain().setContent(collapsibleBlockWithSelection).run();
    // editor.chain().setContent(collapsibleBlockWithSelection).setTextSelection({ from: 3, to: 5 }).run();
    const [pos] = setUpEditorWithSelection(
      editor,
      `<collapsible-block>
        <collapsible-summary>|Header</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );
    expect(pos).toEqual(3);

    expect(editor.state.doc.childCount).toBe(1);

    // console.log('html', editor.getHTML());

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    const { doc } = editor.state;
    console.log(editor.getHTML());
    // A new collapsible should have been added
    expect(doc.childCount).toBe(3);

    expect(getText(doc.child(0))).toEqual('Header');
    expect(getText(doc.child(1))).toEqual('Content Line 1');
    expect(getText(doc.child(2))).toEqual('Content Line 2');
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
