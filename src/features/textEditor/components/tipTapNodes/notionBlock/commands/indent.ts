import { Command } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { ReplaceStep } from '@tiptap/pm/transform';
import { TextSelection } from 'prosemirror-state';

import { NotionBlockNode } from '../NotionBlockNode';

export const indent: Command = ({ state, tr, dispatch }) => {
  const { $from } = tr.selection;
  if (!tr.selection.empty || $from.node(-1).type.name !== NotionBlockNode.name) {
    return false;
  }

  // If the current node does not have a NotionBlockNode sibling, the node cannot be indented
  const beforePosition = $from.before(-1);
  if (beforePosition === 0 || tr.doc.resolve(beforePosition - 1).parent.type.name !== NotionBlockNode.name) {
    return false;
  }

  if (dispatch) {
    const notionBlockType = state.schema.nodes[NotionBlockNode.name];

    const fragment = Fragment.from(notionBlockType.create(null, $from.parent));

    tr.step(new ReplaceStep($from.before(-1) - 1, $from.after(), new Slice(fragment, 0, 0)));
    tr.setSelection(TextSelection.create(tr.doc, $from.pos - 1));
    dispatch(tr);
  }
  return true;
};
