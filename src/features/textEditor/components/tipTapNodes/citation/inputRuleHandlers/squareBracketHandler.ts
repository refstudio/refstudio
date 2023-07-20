import { TextSelection } from '@tiptap/pm/state';
import { InputRule } from '@tiptap/react';

import { CitationNode } from '../CitationNode2';

export const squareBracketHandler = ({
  state,
  range,
}: Pick<Parameters<InputRule['handler']>[0], 'state' | 'range'>): void => {
  const { tr } = state;
  const start = range.from;

  // When inserting a citation node, also inserts a '@' character to open the reference selector
  tr.delete(start, start + 1)
    .insert(start, state.schema.nodes[CitationNode.name].create({}, state.schema.text('@')))
    .setSelection(TextSelection.create(tr.doc, state.selection.from + 2));
};
