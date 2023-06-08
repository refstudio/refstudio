import './DraggableBlock.css';

import { Editor, NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import { cx } from '../../cx';

interface DraggableBlockProps {
    editor: Editor;
    getPos: () => number;
    selected: boolean;
}

export function DraggableBlock({ editor, getPos, selected }: DraggableBlockProps) {
    return <NodeViewWrapper>
        <div className={cx('draggable-block', { selected })}>
            <div className="drag-handle" contentEditable="false" data-drag-handle draggable="true" onClick={() => {
                editor.commands.setNodeSelection(getPos());
            }} />

            <NodeViewContent className="content" />
        </div>
    </NodeViewWrapper>;
}