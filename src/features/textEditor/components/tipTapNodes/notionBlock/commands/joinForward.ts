import { Command } from '@tiptap/core';
import { Fragment } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from 'prosemirror-transform';

export const joinForward: Command = ({ state, tr, view, dispatch }) => {
  if (!tr.selection.empty || !view.endOfTextblock('forward', state)) {
    return false;
  }

  const { $from } = tr.selection;

  // Find the next text node
  const docSize = tr.doc.content.size;
  const afterPosition = $from.after();

  let i = 1;
  while (afterPosition + i < docSize && !tr.doc.resolve(afterPosition + i).parent.isTextblock) {
    i++;
  }
  const textNodePosition = afterPosition + i;

  if (textNodePosition === docSize) {
    return false;
  }

  if (dispatch) {
    const resolvedTextNodePosition = tr.doc.resolve(textNodePosition);
    tr.insert($from.pos, resolvedTextNodePosition.nodeAfter ?? Fragment.empty);

    const updatedBeforePosition = tr.mapping.map(resolvedTextNodePosition.before(-1));
    const updatedAfterPosition = tr.mapping.map(resolvedTextNodePosition.after(-1));

    tr.step(
      new ReplaceStep(
        updatedBeforePosition,
        updatedAfterPosition,
        tr.doc.slice(updatedBeforePosition + resolvedTextNodePosition.parent.nodeSize + 1, updatedAfterPosition - 1),
      ),
    );

    tr.setSelection(TextSelection.near(tr.doc.resolve($from.pos)));
    dispatch(tr);
  }
  return true;
};
