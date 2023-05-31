import './CollapsibleBlock.css';

import { Node } from '@tiptap/pm/model';
import { Editor, NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import { cx } from '../../cx';
import {
  CollapsibleBlockNode,
  CollapsibleBlockNodeAttributes,
  emptyCollapsibleBlock,
} from './nodes/CollapsibleBlockNode';

// The attributes in this interface must correspond to the attributes defined in the `addAttributes` method of CollapsibleBlockNode
export interface CollapsibleBlockProps {
  editor: Editor;
  updateAttributes: (attributes: CollapsibleBlockNodeAttributes) => void;
  node: Node & { attrs: CollapsibleBlockNodeAttributes };
  getPos: () => number;
}

export const CollapsibleBlock = (props: CollapsibleBlockProps) => {
  const handleButtonClick = () => {
    const {
      node,
      node: {
        attrs: { folded },
      },
    } = props;
    const currentNodePos = props.getPos();

    props.editor
      .chain()
      // Add or remove empty content block
      .command(({ commands }) => {
        if (node.childCount > 0) {
          const collapsibleBlockSummary = node.child(0);
          const summaryNodeSize = collapsibleBlockSummary.nodeSize;
          // If the node is folded with only a summary, unfolding it adds an empty content node
          if (folded && node.childCount === 1) {
            return commands.insertContentAt(currentNodePos + summaryNodeSize, {
              type: 'collapsibleContent',
              content: [emptyCollapsibleBlock],
            });
            // If the node is unfolded with an empty content node, folding it removes the node
          } else if (!folded && node.childCount === 2) {
            const contentNode = node.child(1).child(0);
            if (
              (contentNode.type.name === 'paragraph' && contentNode.nodeSize === 2) || // 2 corresponds to a node containing an empty paragraph.
              (contentNode.type.name === CollapsibleBlockNode.name && contentNode.nodeSize === 6) // 6 corresponds to a node containing an empty collapsible block.
            ) {
              const contentNodePos = currentNodePos + summaryNodeSize + 1;
              const contentNodeSize = contentNode.nodeSize;
              return commands.deleteRange({ from: contentNodePos, to: contentNodePos + contentNodeSize });
            }
          }
        }
        return true;
      })
      // Update focus when the cursor is in the collapsible content and the user tries to fold the block
      .command(({ commands, state }) => {
        if (!folded && node.childCount >= 2) {
          const summarySize = node.child(0).nodeSize;
          const contentSize = node.child(1).nodeSize;
          const contentNodeBeginPos = currentNodePos + summarySize + 1;
          const contentNodeEndPos = contentNodeBeginPos + contentSize;
          const { ranges } = state.selection;
          if (
            ranges.some(
              ({ $from, $to }) =>
                (contentNodeBeginPos <= $from.pos && $from.pos < contentNodeEndPos) ||
                (contentNodeBeginPos <= $to.pos && $to.pos < contentNodeEndPos),
            )
          ) {
            return commands.focus(currentNodePos + summarySize - 1);
          }
        }
        return true;
      })
      .run();
    // Toggle the folded attribute of the node
    props.updateAttributes({
      folded: !props.node.attrs.folded,
    });
  };
  return (
    <NodeViewWrapper>
      <div className="draggable-item collapsible-block flex flex-row items-start">
        <div className="drag-handle" contentEditable="false" data-drag-handle draggable="true" />
        <button
          className={cx({
            folded: props.node.attrs.folded,
          })}
          onClick={handleButtonClick}
        />

        <NodeViewContent className={cx('content', { folded: props.node.attrs.folded })} />
      </div>
    </NodeViewWrapper>
  );
};
