import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import './styles.css';

export const CollapsibleBlock = (props: any) => {
    const handleButtonClick = () => {
        props.updateAttributes({
            folded: !props.node.attrs.folded,
        });
    };
    return (
        <NodeViewWrapper>
            <div className='draggable-item collapsible-block' style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                <div
                    className="drag-handle"
                    contentEditable="false"
                    draggable="true"
                    data-drag-handle
                    style={{ backgroundImage: `url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="0.2" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>')` }}
                />
                <button className={props.node.attrs.folded ? '' : 'open'} onClick={handleButtonClick} />

                <NodeViewContent className={`content ${props.node.attrs.folded ? "folded" : ""}`} />
            </div>
        </NodeViewWrapper>
    )
}