import { Command } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from 'prosemirror-transform';

import { NotionBlockNode } from '../NotionBlockNode';

export const unindent: Command = ({ tr, dispatch }) => {
  const { $from } = tr.selection;
  if (!tr.selection.empty || $from.node(-1).type.name !== NotionBlockNode.name) {
    return false;
  }

  // If the current node's grandparent is not a NotionBlockNode, then the node cannot be unindented
  if ($from.depth <= 2 || $from.node(-2).type.name !== NotionBlockNode.name) {
    return false;
  }

  if (dispatch) {
    tr.step(
      new ReplaceStep(
        $from.before(-1),
        $from.after(-1), // $from.node(-1).content
        new Slice(Fragment.from($from.node(-2).copy()).addToEnd($from.node(-1)), 1, 1),
      ),
    );
    tr.setSelection(TextSelection.create(tr.doc, $from.pos + 1));
    dispatch(tr);
  }
  return true;
};
