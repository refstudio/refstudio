import { TextSelection } from '@tiptap/pm/state';
import { Command } from '@tiptap/react';

import { BlockSelection } from '../selection/BlockSelection';

export function toggleMark(mark: string): Command {
  return ({ tr, dispatch, commands, can, chain }) => {
    const { selection } = tr;
    if (!(selection instanceof BlockSelection)) {
      return dispatch ? commands.toggleMark(mark) : can().toggleMark(mark);
    }
    const endPos = selection.to + tr.doc.nodeAt(selection.to)!.nodeSize;
    if (dispatch) {
      return chain()
        .command(() => {
          tr.setSelection(TextSelection.between(tr.doc.resolve(selection.from + 2), tr.doc.resolve(endPos), -1));
          return true;
        })
        .toggleMark(mark)
        .command(() => {
          tr.setSelection(selection.map(tr.doc, tr.mapping));
          return true;
        })
        .run();
    } else {
      return can()
        .chain()
        .command(() => {
          tr.setSelection(TextSelection.between(tr.doc.resolve(selection.from + 2), tr.doc.resolve(endPos), -1));
          return true;
        })
        .toggleMark(mark)
        .run();
    }
  };
}
