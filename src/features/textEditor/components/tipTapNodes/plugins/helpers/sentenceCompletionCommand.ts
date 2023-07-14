import { Command } from '@tiptap/react';

import { SentenceCompletionMetadata } from '../../types/SentenceCompletionMetadata';
import { sentenceCompletionPluginKey } from '../sentenceCompletion';

export const sentenceCompletionCommand: Command = ({ dispatch, state, tr }) => {
  if (!state.selection.empty) {
    return false;
  }
  if (dispatch) {
    const { parent, parentOffset } = state.selection.$from;
    const text = parent.textBetween(0, parentOffset);

    const openMetadata: SentenceCompletionMetadata = {
      type: 'open',
      query: text,
    };

    tr.setMeta(sentenceCompletionPluginKey, openMetadata);

    dispatch(tr);
  }
  return true;
};
