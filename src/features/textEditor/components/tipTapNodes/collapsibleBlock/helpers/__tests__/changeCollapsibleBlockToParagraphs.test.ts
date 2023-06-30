import { TextSelection } from '@tiptap/pm/state';
import { Editor, getText } from '@tiptap/react';

import { EDITOR_EXTENSIONS } from '../../../../tipTapEditorConfigs';
import { defaultCollapsibleBlock } from '../../../test-fixtures';
import { findNodesByNodeType } from '../../../test-utils';
import { changeCollapsibleBlockToParagraphs } from '../changeCollapsibleBlockToParagraphs';

describe('changeCollapsibleBlockToParagraph', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  beforeEach(() => {
    editor.commands.setContent(defaultCollapsibleBlock);
  });

  it('should transform collapsible block into paragraphs', () => {
    const { from } = TextSelection.near(editor.state.doc.resolve(0));

    expect(editor.state.doc.childCount).toBe(1);
    const [initialSummary] = findNodesByNodeType(editor.state.doc, 'collapsibleSummary');
    expect(initialSummary).toBeDefined();

    const [contentBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleContent');
    expect(contentBlock).toBeDefined();
    expect(contentBlock.childCount).toBe(2);
    const initialContent = [contentBlock.child(0), contentBlock.child(1)];

    editor.commands.command(({ tr }) => {
      changeCollapsibleBlockToParagraphs(from, editor.schema, tr);
      return true;
    });

    const { doc } = editor.state;
    expect(doc.childCount).toBe(3);
    expect(getText(doc.child(0))).toEqual(getText(initialSummary));
    expect(getText(doc.child(1))).toEqual(getText(initialContent[0]));
    expect(getText(doc.child(2))).toEqual(getText(initialContent[1]));
  });

  it('should not do anything if pos does not belong to a collapsibleBlock', () => {
    const initialDoc = editor.state.doc;

    editor.commands.command(({ tr }) => {
      changeCollapsibleBlockToParagraphs(0, editor.schema, tr);
      return true;
    });

    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });

  it('should not do anything if there is no collapsibleBlock in the document', () => {
    editor.commands.setContent('<p></p>');
    expect(findNodesByNodeType(editor.state.doc, 'collapsibleBlock')).toHaveLength(0);

    const { from } = TextSelection.near(editor.state.doc.resolve(0));
    const initialDoc = editor.state.doc;

    editor.commands.command(({ tr }) => {
      changeCollapsibleBlockToParagraphs(from, editor.schema, tr);
      return true;
    });

    expect(editor.state.doc.toJSON()).toEqual(initialDoc.toJSON());
  });
});
