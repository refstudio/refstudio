import { Editor, EditorContent } from '@tiptap/react';

import { act, screen, setup } from '../../utils/test-utils';
import { defaultCollapsibleBlock, uncollapsedCollapsibleBlockWithEmptyContent } from '../test-fixtures';
import { findNodesByNodeType } from '../test-utils';
import { EDITOR_EXTENSIONS } from '../TipTapEditorConfigs';


describe('CollapsibleBlock', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  test('should collapse block when clicking on the arrow', async () => {
    editor.commands.setContent(uncollapsedCollapsibleBlockWithEmptyContent);
    const { user } = setup(<EditorContent editor={editor} />);

    let [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBeFalsy();

    await act(async () => {
      await user.click(screen.getByRole('button'));
    });

    [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBeTruthy();
  });

  test('should uncollapse block when clicking on the arrow', async () => {
    editor.commands.setContent(defaultCollapsibleBlock);
    const { user } = setup(<EditorContent editor={editor} />);

    let [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBeTruthy();

    await act(async () => {
      await user.click(screen.getByRole('button'));
    });

    [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBeFalsy();
  });
});
