import './NotionBlock.css';

import { Node } from '@tiptap/pm/model';
import { Editor, NodeViewContent, NodeViewWrapper } from '@tiptap/react';

import { cx } from '../../../../../lib/cx';
import { BlockSelection } from './selection/BlockSelection';

interface NotionBlockProps {
  editor: Editor;
  getPos: () => number;
  node: Node;
}

export function NotionBlock({ editor, node, getPos }: NotionBlockProps) {
  return (
    <NodeViewWrapper>
      <div
        className={cx('notion-block', {
          collapsed: node.attrs.type === 'collapsible' && !!node.attrs.collapsed,
          'list-item':
            node.attrs.type === 'collapsible' ||
            node.attrs.type === 'unorderedList' ||
            node.attrs.type === 'orderedList',
        })}
      >
        <div
          className="drag-handle"
          contentEditable="false"
          data-drag-handle
          onClick={() => {
            editor.commands.command(({ tr, dispatch, state }) => {
              if (dispatch) {
                tr.setSelection(new BlockSelection(state.doc.resolve(getPos())));
                dispatch(tr);
              }
              return true;
            });
          }}
        />
        <NodeViewContent className="content" />
      </div>
    </NodeViewWrapper>
  );
}
