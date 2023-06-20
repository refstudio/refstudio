import { TextSelection } from '@tiptap/pm/state';
import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock } from '../../test-fixtures';
import { findNodesByNodeType, getText } from '../../test-utils';
import { EDITOR_EXTENSIONS } from '../../TipTapEditorConfigs';
import { unsetPartiallySelectedCollapsibleBlocks } from './unsetPartiallySelectedCollapsibleBlocks';

describe('unsetPartiallySelectedCollapsibleBlocks', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  beforeEach(() => {
    editor.commands.setContent('<p>First paragraph</p>' + defaultCollapsibleBlock + '<p>Last paragraph</p>');
  });

  test('should unset the collapsible block when it is partially selected', () => {
    const selection = TextSelection.between(editor.state.doc.resolve(0), editor.state.doc.resolve(30));
    expect(editor.state.doc.childCount).toBe(3);
    const [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.childCount).toBe(2);
    const firstParagraph = editor.state.doc.child(0);
    const lastParagraph = editor.state.doc.child(2);
    const initialSummary = collapsibleBlock.child(0);
    const contentBlock = collapsibleBlock.child(1);
    expect(contentBlock.childCount).toBe(2);
    const initialContent = [contentBlock.child(0), contentBlock.child(1)];

    const commandResult = editor
      .chain()
      .setTextSelection(selection)
      .command(unsetPartiallySelectedCollapsibleBlocks)
      .run();
    expect(commandResult).toBe(true);

    const { doc } = editor.state;
    expect(doc.childCount).toBe(5);
    expect(doc.child(0).toJSON()).toEqual(firstParagraph.toJSON());
    // The collapsible summary is not a block but is transformed into a block when unsetting the collapsing block,
    // so we can only test that the text has been preserved
    expect(getText(doc.child(1))).toEqual(getText(initialSummary));
    expect(doc.child(2).toJSON()).toEqual(initialContent[0].toJSON());
    expect(doc.child(3).toJSON()).toEqual(initialContent[1].toJSON());
    expect(doc.child(4).toJSON()).toEqual(lastParagraph.toJSON());
  });

  test('should not do anything if the collapsible block is completely selected', () => {
    const initialDoc = editor.state.doc;

    const commandResult = editor.chain().selectAll().command(unsetPartiallySelectedCollapsibleBlocks).run();
    expect(commandResult).toBe(true);

    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything if the selection head is inside the collapsible block', () => {
    const firstParagraph = editor.state.doc.child(0);
    const selection = TextSelection.between(
      // + 6 is to position the caret in the middle of the collapsible summary
      editor.state.doc.resolve(firstParagraph.nodeSize + 6),
      editor.state.doc.resolve(30),
    );
    const initialDoc = editor.state.doc;

    const commandResult = editor
      .chain()
      .setTextSelection(selection)
      .command(unsetPartiallySelectedCollapsibleBlocks)
      .run();
    expect(commandResult).toBe(false);

    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
