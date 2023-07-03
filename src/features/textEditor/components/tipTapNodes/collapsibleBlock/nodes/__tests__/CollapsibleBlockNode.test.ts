import { Editor } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { defaultCollapsibleBlockWithCursor, oneLineCollapsibleBlock } from '../../../__tests__/test-fixtures';
import {
  findNodesByNodeType,
  getPrettyHTMLWithSelection,
  setUpEditorWithSelection,
} from '../../../__tests__/test-utils';

describe('CollapsibleBlockNode commands', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  describe('toggleCollapsedCollapsibleBlock command', () => {
    it('should uncollapse with command', () => {
      const [from] = setUpEditorWithSelection(editor, defaultCollapsibleBlockWithCursor);
      // The node is collapsed by default
      const collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(1);

      const [collapsibleBlock] = collapsibleBlocks;
      expect(collapsibleBlock.attrs.folded).toBe(true);

      // Uncollapse node
      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
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

    it('should collapse with command', () => {
      const [from] = setUpEditorWithSelection(
        editor,
        `<collapsible-block folded='false'>
            <collapsible-summary>|Header</collapsible-summary>
            <collapsible-content>
                <p>Content Line 1</p>
                <p>Content Line 2</p>
            </collapsible-content>
        </collapsible-block>`,
      );

      // The node is uncollapsed
      const collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(1);

      const [collapsibleBlock] = collapsibleBlocks;
      expect(collapsibleBlock.attrs.folded).toBe(false);

      // Collapse the node
      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
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

    it('should add empty content when uncollapsing', () => {
      const [from] = setUpEditorWithSelection(
        editor,
        `<collapsible-block folded='true'>
          <collapsible-summary>|</collapsible-summary>
        </collapsible-block>`,
      );

      const collapsibleContents = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
      expect(collapsibleContents).toHaveLength(0);

      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(true);

      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<collapsible-block folded='false'>
          <collapsible-summary>|</collapsible-summary>
          <collapsible-content><p></p></collapsible-content>
        </collapsible-block>"
      `);
    });

    it('should remove empty content when collapsing', () => {
      const [from] = setUpEditorWithSelection(
        editor,
        `<collapsible-block folded='false'>
            <collapsible-summary>|</collapsible-summary>
            <collapsible-content>
                <p></p>
            </collapsible-content>
        </collapsible-block>`,
      );

      const collapsibleContents = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
      expect(collapsibleContents).toHaveLength(1);

      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(true);

      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<collapsible-block folded='true'>
          <collapsible-summary>|</collapsible-summary>
        </collapsible-block>"
      `);
    });

    it('should not do anything if run from a paragraph', () => {
      const [from] = setUpEditorWithSelection(editor, '<p>|</p>');

      const initialDoc = editor.state.doc;

      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });

  describe('setCollapsibleBlock command', () => {
    it('should wrap paragraph in a collapsible block', () => {
      setUpEditorWithSelection(editor, '<p>|</p>');

      const commandResult = editor.commands.setCollapsibleBlock();
      expect(commandResult).toBe(true);

      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<collapsible-block folded='true'>
          <collapsible-summary>|</collapsible-summary>
        </collapsible-block>"
      `);
    });

    it('should not do anything if content is already in a collapsible block', () => {
      setUpEditorWithSelection(editor, defaultCollapsibleBlockWithCursor);
      const initialDoc = editor.state.doc;

      const commandResult = editor.commands.setCollapsibleBlock();
      expect(commandResult).toBe(false);

      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });

    it('should not do anything if block cannot be turned into collapsible block', () => {
      setUpEditorWithSelection(editor, '<h1>|Some content</h1>');
      const initialDoc = editor.state.doc;

      const commandResult = editor.commands.setCollapsibleBlock();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });

    it('should not do anything if selection is not empty', () => {
      setUpEditorWithSelection(editor, '<p>|Some| text</p>');
      const initialDoc = editor.state.doc;

      const commandResult = editor.commands.setCollapsibleBlock();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });

  describe('unsetCollapsibleBlock command', () => {
    it('should unwrap block and add all its content blocks to the document', () => {
      setUpEditorWithSelection(editor, defaultCollapsibleBlockWithCursor);

      expect(editor.state.doc.childCount).toBe(1);

      const commandResult = editor.commands.unsetCollapsibleBlock();
      expect(commandResult).toBe(true);

      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<p>|Header</p>
        <p>Content Line 1</p>
        <p>Content Line 2</p>"
      `);
    });

    it('should unwrap block and add its content block to the document', () => {
      setUpEditorWithSelection(editor, oneLineCollapsibleBlock);

      const commandResult = editor.commands.unsetCollapsibleBlock();
      expect(commandResult).toBe(true);

      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<p>|Header</p>
        <p>Content Line</p>"
      `);
    });

    it('should not do anything if content is not in a collapsible block', () => {
      setUpEditorWithSelection(editor, '<p>|</p>');
      const initialDoc = editor.state.doc;

      const commandResult = editor.commands.unsetCollapsibleBlock();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });

    it('should not do anything if the selection is not empty', () => {
      setUpEditorWithSelection(
        editor,
        `<collapsible-block>
          <collapsible-summary>|Header</collapsible-summary>
          <collapsible-content>
              <p>Co|ntent Line 1</p>
              <p>Content Line 2</p>
          </collapsible-content>
        </collapsible-block>`,
      );
      const initialDoc = editor.state.doc;

      const commandResult = editor.commands.unsetCollapsibleBlock();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });

  describe('splitCollapsibleBlock command', () => {
    it('should split collapsible block into 2 collapsible blocks', () => {
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

      const commandResult = editor.commands.splitCollapsibleBlock();
      expect(commandResult).toBe(true);

      const collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(2);

      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<collapsible-block folded='true'>
          <collapsible-summary>Hea</collapsible-summary>
          <collapsible-content>
            <p>Content Line 1</p>
            <p>Content Line 2</p>
          </collapsible-content>
        </collapsible-block>
        <collapsible-block folded='true'>
          <collapsible-summary>|der</collapsible-summary>
        </collapsible-block>"
      `);
    });

    it('should split collapsed collapsible block with no content into 2 collapsible blocks', () => {
      setUpEditorWithSelection(
        editor,
        `<collapsible-block folded='false'>
          <collapsible-summary>|</collapsible-summary>
        </collapsible-block>`,
      );

      const commandResult = editor.commands.splitCollapsibleBlock();
      expect(commandResult).toBe(true);

      expect(getPrettyHTMLWithSelection(editor)).toMatchInlineSnapshot(`
        "<collapsible-block folded='false'>
          <collapsible-summary></collapsible-summary>
        </collapsible-block>
        <collapsible-block folded='false'>
          <collapsible-summary>|</collapsible-summary>
        </collapsible-block>"
      `);
    });

    it('should not do anything if the selection is not empty', () => {
      setUpEditorWithSelection(
        editor,
        `<collapsible-block>
          <collapsible-summary>Hea|d|er</collapsible-summary>
          <collapsible-content>
              <p>Content Line 1</p>
              <p>Content Line 2</p>
          </collapsible-content>
        </collapsible-block>`,
      );

      const initialDoc = editor.state.doc;

      const commandResult = editor.commands.splitCollapsibleBlock();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });

    it('should not do anything if the block is not a collapsibleBlock', () => {
      setUpEditorWithSelection(editor, '<p>|</p>');
      const initialDoc = editor.state.doc;

      const commandResult = editor.chain().setTextSelection(0).splitCollapsibleBlock().run();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });
});
