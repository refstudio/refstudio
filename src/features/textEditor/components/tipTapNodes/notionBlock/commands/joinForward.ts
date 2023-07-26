import { Command } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';

import { addUnindentSteps } from './unindent';

export const joinForward: Command = ({ dispatch, state, tr, view }) => {
  if (tr.selection.empty && !view.endOfTextblock('forward', state)) {
    return false;
  }

  let { to } = tr.selection;

  if (tr.selection.empty) {
    // Find the next text node
    do {
      to++;
    } while (to < tr.doc.content.size && !tr.doc.resolve(to).parent.isTextblock);
  }
  if (to === tr.doc.content.size) {
    return true;
  }

  const $to = tr.doc.resolve(to);
  const { $from } = tr.selection;
  if ($from.sameParent($to) || !$from.parent.isTextblock || !$to.parent.isTextblock) {
    return false;
  }

  if (dispatch) {
    // Bring both blocks to the same depth level
    for (let i = 0; i < $from.depth - $to.depth; i++) {
      addUnindentSteps(tr, tr.mapping.map($from.pos));
    }
    for (let i = 0; i < $to.depth - $from.depth; i++) {
      addUnindentSteps(tr, tr.mapping.map($to.pos));
    }

    // Make the second node the type of the first one
    const updatedStart = tr.mapping.map($to.before());
    const updatedEnd = tr.mapping.map($to.after());
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
    tr.step(new ReplaceStep(tr.mapping.map($from.pos), tr.mapping.map(to), Slice.empty));
    tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(to))));

    dispatch(tr);
  }
  return true;
};
