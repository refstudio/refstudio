import { Command } from '@tiptap/react';

import { createOpenAction } from '../../types/SentenceCompletionMetadata';
import { sentenceCompletionPluginKey } from '../SentenceCompletion2';

export const sentenceCompletionCommand: Command = ({ dispatch, state, tr }) => {
  if (!state.selection.empty) {
    return false;
  }
  if (dispatch) {
    const { parent, parentOffset } = state.selection.$from;
    const text = parent.textBetween(0, parentOffset);

    tr.setMeta(sentenceCompletionPluginKey, createOpenAction(text));

    dispatch(tr);
  }
  return true;
};
