import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock, defaultParagraph } from '../../../test-fixtures';
import { getText } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { backspace } from './backspace';

describe('Backspace keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  test('should turn collapsible block back into paragraphs when selection is at the beginning of the summary', () => {
    editor
      .chain()
      .setContent(defaultParagraph + defaultParagraph)
      // 18 is the beginning of the second paragraph
      .setTextSelection(18)
      .run();
    expect(editor.state.doc.childCount).toBe(2);

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    // Paragraphs should have been merged together
    expect(editor.state.doc.childCount).toBe(1);

    expect(getText(editor.state.doc)).toEqual('Some contentSome content');
  });

  test.skip('should unset partially selected collapsible blocks before deleting content', () => {
    editor
      .chain()
      .setContent(defaultParagraph + defaultCollapsibleBlock + defaultCollapsibleBlock)
      // 30 is after the C in "Content Line 1", in the first collapsible block
      .setTextSelection({ from: 7, to: 30 })
      .run();

    expect(editor.state.doc.childCount).toBe(3);

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(true);

    // A new collapsible should have been added
    expect(editor.state.doc.childCount).toBe(3);
  });

  test('should not do anything when the selection is empty and not a the beginning of a block', () => {
    editor
      .chain()
      .setContent(defaultParagraph + defaultParagraph)
      // 18 is the beginning of the second paragraph
      .setTextSelection(19)
      .run();
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  test('should not do anything when the selection is a node selection', () => {
    editor
      .chain()
      .setContent(defaultParagraph + defaultParagraph)
      // 18 is the beginning of the second paragraph
      .setNodeSelection(18)
      .run();
    const initialDoc = editor.state.doc;

    const commandResult = backspace({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
