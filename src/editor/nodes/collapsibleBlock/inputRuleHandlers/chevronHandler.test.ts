import { Editor } from '@tiptap/react';

import { findNodesByNodeType, getText } from '../../../test-utils';
import { EDITOR_EXTENSIONS } from '../../../TipTapEditorConfigs';
import { chevronHandler } from './chevronHandler';

describe('Chevron input rule handler', () => {
  test('should remove "> " and turn paragraph into an uncollapsed and focused collapsible block', () => {
    const editor = new Editor({
      extensions: EDITOR_EXTENSIONS,
    });

    editor.commands.setContent('<p>> Some content</p>');

    chevronHandler({ chain: () => editor.chain(), range: { from: 2, to: 4 } });

    expect(getText(editor.state.doc)).not.toContain('> ');

    const collapsibleBlocks = findNodesByNodeType(editor.state.doc, 'collapsibleBlock');
    expect(collapsibleBlocks).toHaveLength(1);

    const [collapsibleBlock] = collapsibleBlocks;
    expect(getText(collapsibleBlock)).toEqual('Some content');

    expect(collapsibleBlock.attrs.folded).toBe(false);

    expect(editor.state.selection.empty).toBe(true);
    const { $from } = editor.state.selection;

    // The selection should point to the start of the text
    expect(editor.state.doc.nodeAt($from.pos)?.type.name).toEqual('text');
    expect($from.sameParent(editor.state.doc.resolve($from.pos - 1))).toBe(false);
  });
});
