import { Command } from '@tiptap/core';
import { Fragment, NodeType, Slice } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { ReplaceAroundStep } from '@tiptap/pm/transform';
import { ReplaceStep } from 'prosemirror-transform';

export const splitBlock: Command = function (
  this: {
    name: string;
    type: NodeType;
  },
  { dispatch, state, tr },
) {
  const { empty } = tr.selection;
  if (!empty) {
    return false;
  }

  if (dispatch) {
    const { $from, from } = tr.selection;

    const notionBlock = $from.node(-1);
    if (notionBlock.type.name !== this.name) {
      return false;
    }

    if (notionBlock.attrs.type === 'collapsible') {
      if (notionBlock.attrs.collapsed) {
        // Splitting collapsed collapsible block creates a new collaspible block after it

        // Create new collapsible block
        tr.step(
          new ReplaceStep(
            $from.after(-1),
            $from.after(-1),
            new Slice(
              Fragment.from(
                $from.node(-1).copy(Fragment.from(state.schema.nodes.paragraph.create(null, $from.nodeAfter))),
              ),
              0,
              0,
            ),
          ),
        );
        // Remove text after cursor
        tr.step(new ReplaceStep($from.pos, $from.after() - 1, Slice.empty));
        tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map($from.after(-1) - 1))));
      } else {
        // Splitting a non-collapsed collapsible block adds a child to the collapsible block
        tr.step(
          new ReplaceAroundStep(
            $from.pos,
            $from.after(),
            $from.pos,
            $from.after() - 1,
            new Slice(Fragment.from([$from.parent.copy(), this.type.create(null, $from.parent.copy())]), 1, 0),
            3,
            true,
          ),
        );
        return true;
      }
    } else {
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
    }
    dispatch(tr);
  }
  return true;
};
