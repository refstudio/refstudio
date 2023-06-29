import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../tipTapEditorConfigs';
import { defaultCollapsibleBlock } from '../../test-fixtures';
import { getPrettyHTMLWithSelection, setUpEditorWithSelection } from '../../test-utils';
import { unsetPartiallySelectedCollapsibleBlocks } from './unsetPartiallySelectedCollapsibleBlocks';

describe('unsetPartiallySelectedCollapsibleBlocks', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should unset the collapsible block when it is partially selected', () => {
    setUpEditorWithSelection(
      editor,
      `<p>|First paragraph</p>
      <collapsible-block>
        <collapsible-summary>Header</collapsible-summary>
        <collapsible-content>
          <p>C|ontent Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>
      <p>Last paragraph</p>`,
    );

    const commandResult = editor.commands.command(unsetPartiallySelectedCollapsibleBlocks);
    expect(commandResult).toBe(true);

    expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
      "<p>|First paragraph</p>
      <p>Header</p>
      <p>C|ontent Line 1</p>
      <p>Content Line 2</p>
      <p>Last paragraph</p>"
    `);
  });

  it('should not do anything if the collapsible block is completely selected', () => {
    const initialDoc = editor.state.doc;

    const commandResult = editor
      .chain()
      .setContent('<p>First paragraph</p>' + defaultCollapsibleBlock + '<p>Last paragraph</p>')
      .selectAll()
      .command(unsetPartiallySelectedCollapsibleBlocks)
      .run();
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything if the selection head is inside the collapsible block', () => {
    setUpEditorWithSelection(
      editor,
      `<p>First paragraph</p>
      <collapsible-block>
        <collapsible-summary>Hea|der</collapsible-summary>
        <collapsible-content>
          <p>C|ontent Line 1</p>
          <p>Content Line 2</p>
        </collapsible-content>
      </collapsible-block>
      <p>Last paragraph</p>`,
    );
    const initialDoc = editor.state.doc;

    const commandResult = editor.commands.command(unsetPartiallySelectedCollapsibleBlocks);
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
