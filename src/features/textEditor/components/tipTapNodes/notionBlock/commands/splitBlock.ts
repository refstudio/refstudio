import { Command } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { NodeSelection } from '@tiptap/pm/state';
import { ReplaceStep } from 'prosemirror-transform';

import { NotionBlockNode } from '../NotionBlockNode';

export const splitBlock: Command = ({ dispatch, state, tr }) => {
  const { $from } = state.selection;
  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    return false;
  }

  if ($from.node(-1).type.name !== NotionBlockNode.name) {
    return false;
  }

  if (dispatch) {
    if (!state.selection.empty) {
      tr.deleteSelection();
    }

    const { pos } = $from;
    const updatedResolvedPos = tr.doc.resolve(tr.mapping.map(pos));
    const before = Fragment.from($from.node(-1).copy(Fragment.from(updatedResolvedPos.parent.copy())));
    const after = Fragment.from($from.node(-1).copy(Fragment.from(state.schema.nodes.paragraph.create())));

    tr.step(new ReplaceStep(pos, pos, new Slice(before.append(after), 2, 2), true));

    dispatch(tr.scrollIntoView());
  }
  return true;
};
