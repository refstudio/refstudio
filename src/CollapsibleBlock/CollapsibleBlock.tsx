import { Node } from '@tiptap/pm/model';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import classNames from 'classnames';
import { CollapsibleBlockNodeAttributes } from './nodes/CollapsibleBlockNode';
import './styles.css';

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
      <div
        className="draggable-item collapsible-block"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
        }}
      >
        <div
          className="drag-handle"
          contentEditable="false"
          draggable="true"
          data-drag-handle
        />
        <button
          className={classNames({
            folded: props.node.attrs.folded,
          })}
          onClick={handleButtonClick}
        />

        <NodeViewContent
          className={classNames('content', { folded: props.node.attrs.folded })}
        />
      </div>
    </NodeViewWrapper>
  );
};
