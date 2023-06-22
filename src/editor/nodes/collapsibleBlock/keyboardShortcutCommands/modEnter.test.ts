import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock } from '../../../test-fixtures';
import { findNodesByNodeType, getPrettyHTML, setUpEditorWithSelection } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { modEnter } from './modEnter';

describe('Mod-Enter keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  test('should collapse collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block folded='false'>
        <collapsible-summary>|Header</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTML(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded=\\"true\\">
        <collapsible-summary>Header</collapsible-summary>
        <collapsible-content>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>"
    `);
  });

  test('should uncollapse collapsible block', () => {
    editor.chain().setContent(defaultCollapsibleBlock).setTextSelection(0).run();

    let [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(true);

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(true);

    [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(false);
  });

  test('should not do anything when the selection is in the content of the collapsible block', () => {
    editor.chain().setContent(defaultCollapsibleBlock).setTextSelection(15).run();
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when the selection is not in a collapsible block', () => {
    editor
      .chain()
      .setContent('<p>Some content</p>' + defaultCollapsibleBlock)
      .setTextSelection(5)
      .run();
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when the selection is not empty', () => {
    editor.chain().setContent(defaultCollapsibleBlock).selectAll().run();
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
