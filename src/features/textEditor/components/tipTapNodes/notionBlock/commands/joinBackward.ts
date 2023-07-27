import { Command } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';

import { addIndentSteps } from './indent';
import { addUnindentSteps } from './unindent';

export const joinBackward: Command = ({ dispatch, state, tr, view }) => {
  if (tr.selection.empty && !view.endOfTextblock('backward', state)) {
    return false;
  }

  let { from } = tr.selection;

  if (tr.selection.empty) {
    // Find the previous text node
    do {
      from--;
    } while (from >= 0 && !tr.doc.resolve(from).parent.isTextblock);
  }

  if (from === -1) {
    return true;
  }

  const $from = tr.doc.resolve(from);
  const { $to } = tr.selection;
  if ($from.sameParent($to) || !$from.parent.isTextblock || !$to.parent.isTextblock) {
    return false;
  }

  if (dispatch) {
    // Bring both blocks to the same depth level
    for (let i = 0; i < $from.depth - $to.depth; i++) {
      addIndentSteps(tr, tr.mapping.map($to.pos));
    }
    for (let i = 0; i < $to.depth - $from.depth; i++) {
      addUnindentSteps(tr, tr.mapping.map($to.pos));
    }

    // Make the second node the type of the first one
    const updatedStart = tr.mapping.map($to.before());
    const updatedEnd = updatedStart + $to.parent.nodeSize;

    tr.step(
      new ReplaceAroundStep(
        updatedStart,
        updatedEnd,
        updatedStart + 1,
        updatedEnd - 1,
        new Slice(Fragment.from($from.parent.copy()), 0, 0),
        1,
        true,
      ),
    );

    // Remove selection
    tr.step(new ReplaceStep(tr.mapping.map(from), tr.mapping.map($to.pos), Slice.empty));
    tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(from))));

    dispatch(tr);
  }
  return true;
};
