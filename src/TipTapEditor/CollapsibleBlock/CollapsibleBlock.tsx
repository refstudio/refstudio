import './CollapsibleBlock.css';

import { Node } from '@tiptap/pm/model';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import { cx } from '../../cx';
import { CollapsibleBlockNodeAttributes } from './nodes/CollapsibleBlockNode';

// The attributes in this interface must correspond to the attributes defined in the `addAttributes` method of CollapsibleBlockNode
export interface CollapsibleBlockProps {
  updateAttributes: (attributes: CollapsibleBlockNodeAttributes) => void;
  node: Node & { attrs: CollapsibleBlockNodeAttributes };
}

export const CollapsibleBlock = (props: CollapsibleBlockProps) => {
  const handleButtonClick = () => {
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
