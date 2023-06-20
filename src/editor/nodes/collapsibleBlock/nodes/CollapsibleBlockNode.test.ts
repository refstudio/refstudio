import { TextSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';

import {
  collapsedEmptyCollapsibleBlock,
  defaultCollapsibleBlock,
  defaultUncollapsedCollapsibleBlock,
  oneLineCollapsibleBlock,
  uncollapsedCollapsibleBlockWithEmptyContent,
} from '../../../test-fixtures';
import { findNodesByNodeType, getText } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';

describe('CollapsibleBlockNode commands', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  describe('toggleCollapsedCollapsibleBlock command', () => {
    beforeEach(() => {
      editor.commands.setContent(defaultCollapsibleBlock);
    });

    test('should uncollapse with command', () => {
      const { from } = TextSelection.near(editor.state.doc.resolve(0));

      // The node is collapsed by default
      let collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(1);

      let [collapsibleBlock] = collapsibleBlocks;
      expect(collapsibleBlock.attrs.folded).toBe(true);

      // Uncollapse node
      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(true);

      collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(1);

      [collapsibleBlock] = collapsibleBlocks;
      expect(collapsibleBlock.attrs.folded).toBe(false);
    });

    test('should collapse with command', () => {
      editor.commands.setContent(defaultUncollapsedCollapsibleBlock);
      const { from } = TextSelection.near(editor.state.doc.resolve(0));

      // The node is uncollapsed
      let collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(1);

      let [collapsibleBlock] = collapsibleBlocks;
      expect(collapsibleBlock.attrs.folded).toBe(false);

      // Collapse the node
      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(true);

      collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(1);

      [collapsibleBlock] = collapsibleBlocks;
      expect(collapsibleBlock.attrs.folded).toBe(true);
    });

    test('should add empty content when uncollapsing', () => {
      editor.commands.setContent(collapsedEmptyCollapsibleBlock);
      const { from } = TextSelection.near(editor.state.doc.resolve(0));

      let collapsibleContents = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
      expect(collapsibleContents).toHaveLength(0);

      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(true);

      collapsibleContents = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
      expect(collapsibleContents).toHaveLength(1);
    });

    test('should remove empty content when collapsing', () => {
      editor.commands.setContent(uncollapsedCollapsibleBlockWithEmptyContent);
      const { from } = TextSelection.near(editor.state.doc.resolve(0));

      let collapsibleContents = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
      expect(collapsibleContents).toHaveLength(1);

      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(true);

      collapsibleContents = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
      expect(collapsibleContents).toHaveLength(0);
    });

    test('should not do anything if run from a paragraph', () => {
      editor.commands.setContent('<p></p>');
      const initialDoc = editor.state.doc;

      const { from } = TextSelection.near(editor.state.doc.resolve(0));

      const commandResult = editor.commands.toggleCollapsedCollapsibleBlock(from);
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });

  describe('setCollapsibleBlock command', () => {
    test('should wrap paragraph in a collapsible block', () => {
      editor.commands.setContent('<p></p>');

      let collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(0);

      const commandResult = editor.chain().setTextSelection(0).setCollapsibleBlock().run();
      expect(commandResult).toBe(true);

      collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(1);
    });

    test('should not do anything if content is already in a collapsible block', () => {
      editor.commands.setContent(defaultCollapsibleBlock);
      const initialDoc = editor.state.doc;

      const commandResult = editor.chain().setTextSelection(0).setCollapsibleBlock().run();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });

    test('should not do anything if selection is not empty', () => {
      editor.commands.setContent('<p>Some text</p>');
      const initialDoc = editor.state.doc;

      const selection = TextSelection.between(editor.state.doc.resolve(0), editor.state.doc.resolve(5));

      const commandResult = editor.chain().setTextSelection(selection).setCollapsibleBlock().run();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });

  describe('unsetCollapsibleBlock command', () => {
    test('should unwrap block and add all its content blocks to the document', () => {
      editor.commands.setContent(defaultCollapsibleBlock);

      expect(editor.state.doc.childCount).toEqual(1);

      const commandResult = editor.chain().setTextSelection(0).unsetCollapsibleBlock().run();
      expect(commandResult).toBe(true);

      expect(editor.state.doc.childCount).toEqual(3);
      expect(getText(editor.state.doc.child(0))).toEqual('Header');
      expect(getText(editor.state.doc.child(1))).toEqual('Content Line 1');
      expect(getText(editor.state.doc.child(2))).toEqual('Content Line 2');
    });

    test('should unwrap block and add its content block to the document', () => {
      editor.commands.setContent(oneLineCollapsibleBlock);

      expect(editor.state.doc.childCount).toEqual(1);

      const commandResult = editor.chain().setTextSelection(0).unsetCollapsibleBlock().run();
      expect(commandResult).toBe(true);

      expect(editor.state.doc.childCount).toEqual(2);
      expect(getText(editor.state.doc.child(0))).toEqual('Header');
      expect(getText(editor.state.doc.child(1))).toEqual('Content Line');
    });

    test('should not do anything if content is not in a collapsible block', () => {
      editor.commands.setContent('<p></p>');
      const initialDoc = editor.state.doc;

      const commandResult = editor.chain().setTextSelection(0).unsetCollapsibleBlock().run();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });

    test('should not do anything if the selection is not empty', () => {
      editor.commands.setContent(defaultCollapsibleBlock);
      const initialDoc = editor.state.doc;

      const selection = TextSelection.between(editor.state.doc.resolve(0), editor.state.doc.resolve(10));

      const commandResult = editor.chain().setTextSelection(selection).unsetCollapsibleBlock().run();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });

  describe('splitCollapsibleBlock command', () => {
    beforeEach(() => {
      editor.commands.setContent(defaultCollapsibleBlock);
    });

    test('should split collapsible block into 2 collapsible blocks', () => {
      expect(findNodesByNodeType(editor.state.doc, 'collapsibleBlock')).toHaveLength(1);
      const [initialContent] = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
      expect(initialContent).toBeDefined();

      // 6 corresponds to the carret being in the middle of the word 'Header'
      const commandResult = editor.chain().setTextSelection(6).splitCollapsibleBlock().run();
      expect(commandResult).toBe(true);

      const collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
      expect(collapsibleBlocks).toHaveLength(2);

      // The summary should have been split: 'Hea' | 'der'
      const [firstSummaries, secondSummaries] = collapsibleBlocks.map((collapsibleBlock) =>
        findNodesByNodeType(collapsibleBlock, 'collapsibleSummary'),
      );
      expect(firstSummaries).toHaveLength(1);
      expect(getText(firstSummaries[0])).toEqual('Hea');
      expect(secondSummaries).toHaveLength(1);
      expect(getText(secondSummaries[0])).toEqual('der');

      // The content should still be in the first collapsible block
      const [firstCollapsibleBlock, secondCollapsibleBlock] = collapsibleBlocks;
      const firstBlockContentBlocks = findNodesByNodeType(firstCollapsibleBlock, 'collapsibleContent');
      expect(firstBlockContentBlocks).toHaveLength(1);
      expect(firstBlockContentBlocks[0].toJSON()).toEqual(initialContent.toJSON());

      // The second block should not have content
      expect(findNodesByNodeType(secondCollapsibleBlock, 'collapsibleContent')).toHaveLength(0);
    });

    test('should split collapsed collapsible block with no content into 2 collapsible blocks', () => {
      editor.commands.setContent(collapsedEmptyCollapsibleBlock);

      expect(findNodesByNodeType(editor.state.doc, 'collapsibleBlock')).toHaveLength(1);
      expect(findNodesByNodeType(editor.state.doc, 'collapsibleContent')).toHaveLength(0);

      const commandResult = editor.chain().setTextSelection(0).splitCollapsibleBlock().run();
      expect(commandResult).toBe(true);

      expect(findNodesByNodeType(editor.state.doc, 'collapsibleBlock')).toHaveLength(2);
      // No content should have been created
      expect(findNodesByNodeType(editor.state.doc, 'collapsibleContent')).toHaveLength(0);
    });

    test('should not do anything if the selection is not empty', () => {
      // 6 corresponds to the carret being in the middle of the word 'Header'
      const selection = TextSelection.between(editor.state.doc.resolve(6), editor.state.doc.resolve(7));
      const initialDoc = editor.state.doc;

      const commandResult = editor.chain().setTextSelection(selection).splitCollapsibleBlock().run();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });

    test('should not do anything if the block is not a collapsibleBlock', () => {
      editor.commands.setContent('<p></p>');
      const initialDoc = editor.state.doc;

      const commandResult = editor.chain().setTextSelection(0).splitCollapsibleBlock().run();
      expect(commandResult).toBe(false);
      expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
    });
  });
});
