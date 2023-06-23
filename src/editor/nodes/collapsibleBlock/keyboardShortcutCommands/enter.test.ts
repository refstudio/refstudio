import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock } from '../../../test-fixtures';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { enter } from './enter';

describe('Enter keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should split a collapsed collapsible block', () => {
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

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded=\\"true\\">
        <collapsible-summary>Hea</collapsible-summary>
        <collapsible-content>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>
      <collapsible-block folded=\\"true\\">
        <collapsible-summary>|der</collapsible-summary>
      </collapsible-block>"
    `);
  });

  it('should add a new content line to an uncollapsed collapsible block', () => {
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

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded=\\"false\\">
        <collapsible-summary>Hea</collapsible-summary>
        <collapsible-content>
          <p>|der</p>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>"
    `);
  });

  it('should not do anything when the selection is not in a collapsible block', () => {
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

  it('should not do anything when the selection is not empty', () => {
    editor.chain().setContent(defaultCollapsibleBlock).selectAll().run();
    const initialDoc = editor.state.doc;

    const commandResult = enter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
