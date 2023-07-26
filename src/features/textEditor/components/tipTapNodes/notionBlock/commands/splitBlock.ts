import { Command } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceStep } from 'prosemirror-transform';

export const splitBlock: Command = ({ dispatch, state, tr }) => {
  const { empty } = tr.selection;
  if (!empty) {
    return false;
  }

  if (dispatch) {
    const { $from, from } = tr.selection;

    tr.step(
      new ReplaceStep(
        from,
        from,
        new Slice(
          Fragment.from([
            $from.node(-1).copy(Fragment.from($from.parent.copy())),
            $from.node(-1).copy(Fragment.from(state.schema.nodes.paragraph.create())),
          ]),
          2,
          2,
        ),
      ),
    );
    tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(from))));
    dispatch(tr);
  }
  return true;
};
