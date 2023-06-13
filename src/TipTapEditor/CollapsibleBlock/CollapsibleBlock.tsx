import './CollapsibleBlock.css';

import { Node } from '@tiptap/pm/model';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { ElementType } from 'react';

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
    <NodeViewWrapper as={'collapsible-block' as ElementType}>
      <button
        className={cx({
          folded: props.node.attrs.folded,
        })}
        onClick={handleButtonClick}
      />

      <NodeViewContent className={cx('content', { folded: props.node.attrs.folded })} />
    </NodeViewWrapper>
  );
};
