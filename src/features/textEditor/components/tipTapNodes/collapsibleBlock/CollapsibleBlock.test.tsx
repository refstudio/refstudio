import { Editor, EditorContent } from '@tiptap/react';

import { act, screen, setup } from '../../../../../test/test-utils';
import { EDITOR_EXTENSIONS } from '../../tipTapEditorConfigs';
import { defaultCollapsibleBlock, defaultUncollapsedCollapsibleBlock } from '../test-fixtures';
import { findNodesByNodeType } from '../test-utils';

describe('CollapsibleBlock', () => {
  const editor = new Editor({
    extensions: EDITOR_EXTENSIONS,
  });

  it('should collapse block when clicking on the arrow', async () => {
    editor.commands.setContent(defaultUncollapsedCollapsibleBlock);
    const { user } = setup(<EditorContent editor={editor} />);

    let [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(false);

    await act(async () => {
      await user.click(screen.getByRole('button'));
    });

    [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(true);
  });

  it('should uncollapse block when clicking on the arrow', async () => {
    editor.commands.setContent(defaultCollapsibleBlock);
    const { user } = setup(<EditorContent editor={editor} />);

    let [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(true);

    await act(async () => {
      await user.click(screen.getByRole('button'));
    });

    [collapsibleBlock] = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlock).toBeDefined();
    expect(collapsibleBlock.attrs.folded).toBe(false);
  });
});
