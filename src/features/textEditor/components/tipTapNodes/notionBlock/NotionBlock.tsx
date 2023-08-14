import './NotionBlock.css';

import { Node } from '@tiptap/pm/model';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import { cx } from '../../../../../lib/cx';

interface NotionBlockProps {
  node: Node;
}

export function NotionBlock({ node }: NotionBlockProps) {
  return (
    <NodeViewWrapper>
      <div className={cx('notion-block', { collapsed: !!node.attrs.collapsed })}>
        <div className="drag-handle" contentEditable="false" data-drag-handle />
        <NodeViewContent
          className={cx('content', {
            'bullet-list': node.attrs.type === 'bulletList',
          })}
        />
      </div>
    </NodeViewWrapper>
  );
}
