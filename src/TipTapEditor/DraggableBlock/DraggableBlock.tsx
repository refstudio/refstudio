import './DraggableBlock.css';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';

export function DraggableBlock() {
    return <NodeViewWrapper>
        <div className="draggable-block">
            <div className="drag-handle" contentEditable="false" data-drag-handle draggable="true" />

            <NodeViewContent className="content" />
        </div>
    </NodeViewWrapper>;
}