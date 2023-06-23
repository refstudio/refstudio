import { Editor } from '@tiptap/react';

import { defaultCollapsibleBlock, defaultUncollapsedCollapsibleBlock } from '../../../test-fixtures';
import { findNodesByNodeType } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { modEnter } from './modEnter';

describe('Mod-Enter keyboard shortcut command', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should collapse collapsible block', () => {
    editor.chain().setContent(defaultUncollapsedCollapsibleBlock).setTextSelection(0).run();

    let [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(false);

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(true);

    [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(true);
  });

  it('should uncollapse collapsible block', () => {
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

  it('should not do anything when the selection is in the content of the collapsible block', () => {
    editor.chain().setContent(defaultCollapsibleBlock).setTextSelection(15).run();
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything when the selection is not in a collapsible block', () => {
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

  it('should not do anything when the selection is not empty', () => {
    editor.chain().setContent(defaultCollapsibleBlock).selectAll().run();
    const initialDoc = editor.state.doc;

    const commandResult = modEnter({ editor });
    expect(commandResult).toBe(false);
    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
