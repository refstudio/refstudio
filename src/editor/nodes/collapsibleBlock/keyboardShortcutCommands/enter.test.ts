import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock, defaultUncollapsedCollapsibleBlock } from '../../../test-fixtures';
import { findNodesByNodeType, getPrettyHTML, getText, setUpEditorWithSelection } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { enter } from './enter';

describe('Enter keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  test('should split a collapsed collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block>
        <collapsible-summary>Hea|der</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );

    const commandResult = enter({ editor });
    expect(commandResult).toBe(true);

    // A new collapsible should have been added,
    // the first collapsible block should contain the content of the initial block
    // and the second collapsible block should not have content.

    expect(getPrettyHTML(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded=\\"true\\">
        <collapsible-summary>Hea</collapsible-summary>
        <collapsible-content>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>
      <collapsible-block folded=\\"true\\">
        <collapsible-summary>der</collapsible-summary>
      </collapsible-block>"
    `);
  });

  test('should add a new content line to an uncollapsed collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block folded='false'>
        <collapsible-summary>Hea|der</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );

    const commandResult = enter({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTML(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded=\\"false\\">
        <collapsible-summary>Hea</collapsible-summary>
        <collapsible-content>
          <p>der</p>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>"
    `);
  });

  test('should add a new content line to an uncollapsed collapsible block', () => {
    // 6 is to position the caret in the middle of 'Header'
    editor.chain().setContent(defaultUncollapsedCollapsibleBlock).setTextSelection(6).run();
    expect(editor.state.doc.childCount).toBe(1);

    const commandResult = enter({ editor });
    expect(commandResult).toBe(true);

    expect(editor.state.doc.childCount).toBe(1);

    const [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.childCount).toBe(2);
    expect(getText(collapsibleBlock.child(0))).toEqual('Hea');

    const content = collapsibleBlock.child(1);
    expect(content.childCount).toBe(3);
    expect(getText(content.child(0))).toEqual('der');
    expect(getText(content.child(1))).toEqual('Content Line 1');
    expect(getText(content.child(2))).toEqual('Content Line 2');
  });

  test('should not do anything when the selection is not in a collapsible block', () => {
    editor
      .chain()
      .setContent('<p>Some content</p>' + defaultCollapsibleBlock)
      .setTextSelection(2)
      .run();
    const initialDoc = editor.state.doc;

    const commandResult = enter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when the selection is not empty', () => {
    editor.chain().setContent(defaultCollapsibleBlock).selectAll().run();
    const initialDoc = editor.state.doc;

    const commandResult = enter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
