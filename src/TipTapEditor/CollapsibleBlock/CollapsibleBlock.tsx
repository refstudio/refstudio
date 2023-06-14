import './CollapsibleBlock.css';

import { Node } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { Editor, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { ElementType } from 'react';

import { cx } from '../../cx';
import { CollapsibleBlockNodeAttributes } from './nodes/CollapsibleBlockNode';

// The attributes in this interface must correspond to the attributes defined in the `addAttributes` method of CollapsibleBlockNode
export interface CollapsibleBlockProps {
  editor: Editor;
  getPos: () => number;
  node: Node & { attrs: CollapsibleBlockNodeAttributes };
  updateAttributes: (attributes: CollapsibleBlockNodeAttributes) => void;
}

export const CollapsibleBlock = ({ editor, getPos, node, updateAttributes }: CollapsibleBlockProps) => {
  const { folded } = node.attrs;

  const handleButtonClick = () => {
    if (!('collapsibleContent' in editor.schema.nodes)) {
      console.warn();
      return;
    }

    if (!folded) {
      editor.commands.command(({ dispatch, tr }) => {
        if (dispatch) {
          // Reset selection if it was inside the content
          if (node.childCount === 2) {
            const { from, to } = tr.selection;

            const contentStart = getPos() + node.child(0).nodeSize;
            const contentEnd = contentStart + node.child(1).nodeSize;

            // If the intervals [from, to] and [contentStart, contentEnd] overlap, ie part of the content is selected
            if (from <= contentEnd && contentStart <= to) {
              tr.setSelection(TextSelection.near(tr.doc.resolve(contentStart), -1));
            }
          }
          // If the block was unfolded and with empty content block, remove the content block
          if (node.childCount === 2 && node.child(1).nodeSize === 6) {
            const start = getPos() + 1 + node.child(0).nodeSize;
            const end = start + 6;

            tr.delete(start, end);
          }
          dispatch(tr);
        }
        return true;
      });
      // If the collapsible block does not have content, add an empty content block
    } else if (node.childCount === 1) {
      editor.commands.command(({ dispatch, tr }) => {
        if (dispatch) {
          // If the collapsible block does not have content, add an empty content block
          const emptyParagraph = editor.schema.nodes.paragraph.createChecked();
          const draggableBlock = editor.schema.nodes.draggableBlock.createChecked(null, emptyParagraph);
          const contentBlock = editor.schema.nodes.collapsibleContent.createChecked(null, draggableBlock);

          const pos = getPos() + node.nodeSize - 1;

          tr.insert(pos, contentBlock);
          dispatch(tr);
        }
        return true;
      });
    }

    updateAttributes({
      folded: !folded,
    });
  };

  return (
    <NodeViewWrapper as={'collapsible-block' as ElementType}>
      <button className={cx({ folded })} onClick={handleButtonClick} />

      <NodeViewContent className={cx('content', { folded })} />
    </NodeViewWrapper>
  );
};
