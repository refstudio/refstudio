import { TextSelection } from '@tiptap/pm/state';
import { InputRule } from '@tiptap/react';

import { citationNode } from '../citationNode';

export const squareBracketHandler: InputRule['handler'] = ({ state, range }) => {
  const { tr } = state;
  const start = range.from;

  // When inserting a citation node, also inserts a '@' character to open the reference selector
  tr.insert(start, state.schema.nodes[citationNode.name].create({}, state.schema.text('@'))).setSelection(
    TextSelection.create(tr.doc, state.selection.from + 2),
  );
};
