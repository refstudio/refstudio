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
    // If the collapsible block does not have content, add an empty content block
    if (folded && node.childCount === 1) {
      editor.commands.command(({ dispatch, tr }) => {
        if (dispatch) {
          const emptyParagraph = editor.schema.nodes.paragraph.createChecked();
          const draggableBlock = editor.schema.nodes.draggableBlock.createChecked(null, emptyParagraph);
          const contentBlock = editor.schema.nodes.collapsibleContent.createChecked(null, draggableBlock);

          const pos = getPos() + node.nodeSize - 1;

          tr.insert(pos, contentBlock);
          tr.setSelection(TextSelection.near(tr.doc.resolve(pos)));
          dispatch(tr);
        }
        return true;
      });
      // If the block was collapsed and with empty content block, remove the content block
    } else if (!folded && node.childCount === 2 && node.child(1).nodeSize === 6) {
      editor.commands.command(({ dispatch, tr }) => {
        if (dispatch) {
          const start = getPos() + node.child(0).nodeSize;
          const end = start + 8;

          tr.delete(start, end);
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
      <button
        className={cx({ folded })}
        onClick={handleButtonClick}
      />

      <NodeViewContent className={cx('content', { folded })} />
    </NodeViewWrapper>
  );
};
