import './NotionBlock.css';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import { cx } from '../../../../../lib/cx';

export function NotionBlock() {
  return (
    <NodeViewWrapper>
      <div className={cx('notion-block')}>
        <div
          className="drag-handle"
          contentEditable="false"
          data-drag-handle
        />
        <NodeViewContent className="content" />
      </div>
    </NodeViewWrapper >
  );
}