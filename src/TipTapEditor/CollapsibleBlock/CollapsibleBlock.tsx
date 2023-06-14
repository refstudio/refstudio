import './CollapsibleBlock.css';

import { Node } from '@tiptap/pm/model';
import { Editor, NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { ElementType } from 'react';

import { cx } from '../../cx';
import { CollapsibleBlockNodeAttributes } from './nodes/CollapsibleBlockNode';

// The attributes in this interface must correspond to the attributes defined in the `addAttributes` method of CollapsibleBlockNode
export interface CollapsibleBlockProps {
  editor: Editor;
  getPos: () => number;
  node: Node & { attrs: CollapsibleBlockNodeAttributes };
}

export const CollapsibleBlock = ({ editor, getPos, node }: CollapsibleBlockProps) => {
  const { folded } = node.attrs;

  const handleButtonClick = () => {
    editor.commands.toggleCollapsedCollapsibleBlock(getPos() + 2);
  };

  return (
    <NodeViewWrapper as={'collapsible-block' as ElementType}>
      <button className={cx({ folded })} onClick={handleButtonClick} />

      <NodeViewContent className={cx('content', { folded })} />
    </NodeViewWrapper>
  );
};
