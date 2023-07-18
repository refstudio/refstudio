import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

export function Citation() {
  return (
    <NodeViewWrapper as="span">
      [<NodeViewContent as="span" />]
    </NodeViewWrapper>
  );
}
