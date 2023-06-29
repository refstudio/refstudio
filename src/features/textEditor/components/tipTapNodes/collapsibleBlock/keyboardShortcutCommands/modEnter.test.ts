import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../tipTapEditorConfigs';
import { defaultCollapsibleBlock } from '../../test-fixtures';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../test-utils';
import { modEnter } from './modEnter';

describe('Mod-Enter keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should collapse collapsible block', () => {
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

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded='true'>
        <collapsible-summary>|Header</collapsible-summary>
        <collapsible-content>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>"
    `);
  });

  it('should uncollapse collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block folded='true'>
        <collapsible-summary>|Header</collapsible-summary>
        <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(true);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<collapsible-block folded='false'>
        <collapsible-summary>|Header</collapsible-summary>
        <collapsible-content>
          <p>Content Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>"
    `);
  });

  it('should not do anything when the selection is in the content of the collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<collapsible-block folded='true'>
        <collapsible-summary>Header</collapsible-summary>
        <collapsible-content>
            <p>Con|tent Line 1</p>
            <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>`,
    );
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything when the selection is not in a collapsible block', () => {
    setUpEditorWithSelection(editor, '<p>Som|e content</p>' + defaultCollapsibleBlock);
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything when the selection is not empty', () => {
    editor.chain().setContent(defaultCollapsibleBlock).selectAll().run();
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
