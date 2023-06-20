import { TextSelection } from '@tiptap/pm/state';
import { ChainedCommands, Range } from '@tiptap/react';

export function chevronHandler({ chain, range: { from, to } }: { chain: () => ChainedCommands; range: Range }): void {
  chain()
    .command(({ tr, dispatch, state }) => {
      if (dispatch) {
        const start = state.doc.resolve(from);
        const end = state.doc.resolve(to);

        tr.setSelection(new TextSelection(start, end));
        tr.deleteSelection();

        dispatch(tr);
      }
      return true;
    })
    .setCollapsibleBlock()
    .setTextSelection(from + 1)
    .toggleCollapsedCollapsibleBlock(from + 1)
    .run();
}
