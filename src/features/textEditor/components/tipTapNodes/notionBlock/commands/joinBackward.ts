import { Command } from '@tiptap/core';
import { Fragment } from '@tiptap/pm/model';
import { TextSelection } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';

export const joinBackward: Command = ({ dispatch, state, tr, view }) => {
  if (!tr.selection.empty || !view.endOfTextblock('backward', state)) {
    return false;
  }

  // Find the previous text node
  const { $from } = tr.selection;
  const beforePosition = $from.before(-1);
  let i = 1;
  while (beforePosition - i >= 0 && !tr.doc.resolve(beforePosition - i).parent.isTextblock) {
    i++;
  }
  const textNodePosition = beforePosition - i;

  if (textNodePosition < 0) {
    return true;
  }

  if (dispatch) {
    tr.insert(textNodePosition, $from.nodeAfter ?? Fragment.empty);

    const updatedBeforePosition = tr.mapping.map(beforePosition);
    const updatedAfterPosition = tr.mapping.map($from.after(-1));
    tr.step(
      new ReplaceStep(
        updatedBeforePosition,
        updatedAfterPosition,
        tr.doc.slice(updatedBeforePosition + $from.parent.nodeSize + 1, updatedAfterPosition - 1),
      ),
    );

    tr.setSelection(TextSelection.near(tr.doc.resolve(textNodePosition)));

    dispatch(tr);
  }

  return true;
};
