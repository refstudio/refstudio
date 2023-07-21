import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { completeSentence } from '../../../../../api/completion';
import { assertNever } from '../../../../../lib/assertNever';
import {
  createCloseAction,
  createPopulateAction,
  SentenceCompletionMetadata,
} from '../types/SentenceCompletionMetadata';
import { SentenceCompletionState } from '../types/SentenceCompletionState';
import { sentenceCompletionCommand } from './helpers/sentenceCompletionCommand';

export const sentenceCompletionPluginKey = new PluginKey<SentenceCompletionState>('sentenceCompletionPlugin');

const sentenceCompletionPlugin = new Plugin<SentenceCompletionState>({
  state: {
    init: () => ({ status: 'closed' }),
    apply: (transaction, state): SentenceCompletionState => {
      const metadata = transaction.getMeta(sentenceCompletionPluginKey) as SentenceCompletionMetadata | undefined;
      if (!metadata || metadata.action === 'close' || (state.status === 'error' && metadata.action !== 'open')) {
        return { status: 'closed' };
      }

      switch (metadata.action) {
        case 'open': {
          // If the plugin was not open, open it with 'pending' status
          if (state.status !== 'open') {
            const cursorPos = transaction.selection.$to.pos;
            return {
              status: 'pending',
              pos: cursorPos,
              query: metadata.query,
            };
          }
          // Otherwise, cycle through the choices
          const newIndex = (state.visibleChoiceIndex + 1) % state.suggestionChoices.length;
          return { ...state, visibleChoiceIndex: newIndex };
        }
        case 'populate': {
          // If the plugin has been closed before receiving the results, there is nothing to update
          if (state.status === 'closed') {
            return state;
          }
          if (metadata.suggestionChoices.length === 0) {
            return { pos: state.pos, status: 'error', text: 'Sentence completion returned no result' };
          }
          return {
            status: 'open',
            pos: state.pos,
            visibleChoiceIndex: 0,
            suggestionChoices: metadata.suggestionChoices,
          };
        }
        default:
          assertNever(metadata);
      }
    },
  },
  view: () => ({
    update: (view, prevState) => {
      const prevPluginState = sentenceCompletionPluginKey.getState(prevState);
      const nextPluginState = sentenceCompletionPluginKey.getState(view.state);

      if (prevPluginState?.status !== nextPluginState?.status && nextPluginState?.status === 'pending') {
        void completeSentence(nextPluginState.query).then((suggestionChoices) => {
          view.dispatch(view.state.tr.setMeta(sentenceCompletionPluginKey, createPopulateAction(suggestionChoices)));
        });
      }
    },
  }),
  props: {
    decorations(state) {
      const currentState = this.getState(state);
      if (!currentState || currentState.status === 'closed') {
        return null;
      }

      const { pos } = currentState;
      const suggestionText =
        currentState.status === 'pending'
          ? '...'
          : currentState.status === 'error'
          ? currentState.text
          : currentState.suggestionChoices[currentState.visibleChoiceIndex];

      return DecorationSet.create(state.doc, [
        Decoration.widget(pos, () => {
          const parentNode = document.createElement('span');

          parentNode.innerHTML = suggestionText;
          parentNode.style.color = 'hsl(var(--color-muted))';

          if (currentState.status === 'error') {
            parentNode.style.color = 'hsl(var(--color-error))';
          }

          return parentNode;
        }),
      ]);
    },
    handleKeyDown(view, event) {
      const currentState = this.getState(view.state);
      if (!currentState || currentState.status === 'closed') {
        return false;
      }

      if (event.code === 'Tab' || event.code === 'ArrowRight' || event.code === 'Enter') {
        if (currentState.status === 'open') {
          const { suggestionChoices, visibleChoiceIndex: index } = currentState;

          view.dispatch(
            view.state.tr
              .insertText(suggestionChoices[index])
              .setMeta(sentenceCompletionPluginKey, createCloseAction()),
          );
        }
        return true;
      }
      if (event.code === 'Escape') {
        view.dispatch(view.state.tr.setMeta(sentenceCompletionPluginKey, createCloseAction()));
        return true;
      }
      return false;
    },
  },
  key: sentenceCompletionPluginKey,
});

export const SentenceCompletionExtension = Extension.create({
  name: 'sentenceCompletionExtension',

  addProseMirrorPlugins: () => [sentenceCompletionPlugin],

  addKeyboardShortcuts: () => ({
    /* c8 ignore next */
    'Mod-j': ({ editor }) => editor.commands.command(sentenceCompletionCommand),
  }),
});
