import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { completeSentence } from '../../../../../api/completion';
import { assertNever } from '../../../../../lib/assertNever';
import { SentenceCompletionMetadata } from '../types/SentenceCompletionMetadata';
import { SentenceCompletionState } from '../types/SentenceCompletionState';
import { sentenceCompletionCommand } from './helpers/sentenceCompletionCommand';

export const sentenceCompletionPluginKey = new PluginKey<SentenceCompletionState>('sentenceCompletionPlugin');

const sentenceCompletionPlugin = new Plugin<SentenceCompletionState>({
  state: {
    init: () => ({ status: 'closed' }),
    apply: (transaction, state): SentenceCompletionState => {
      const metadata = transaction.getMeta(sentenceCompletionPluginKey) as SentenceCompletionMetadata | undefined;
      if (!metadata || metadata.type === 'close') {
        return { status: 'closed' };
      }

      const cursorPos = transaction.selection.$to.pos;

      switch (metadata.type) {
        case 'open': {
          // If the plugin is already open, cycle through the choices
          if (state.status === 'open') {
            const newIndex = (state.index + 1) % state.suggestionChoices.length;
            return { ...state, index: newIndex };
          }
          // Otherwise open the plugin with 'pending' status
          return {
            status: 'pending',
            pos: cursorPos,
            query: metadata.query,
          };
        }
        case 'populate': {
          // If the plugin has been closed before receiving the results, there is nothing to update
          if (state.status === 'closed') {
            return state;
          }
          if (metadata.suggestionChoices.length === 0) {
            console.warn('Sentence completion returned no result');
            return { status: 'closed' };
          }
          return {
            status: 'open',
            pos: state.pos,
            index: 0,
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
          const metadata: SentenceCompletionMetadata = {
            type: 'populate',
            suggestionChoices,
          };
          view.dispatch(view.state.tr.setMeta(sentenceCompletionPluginKey, metadata));
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
        currentState.status === 'pending' ? ' ...' : ` ${currentState.suggestionChoices[currentState.index]}`;

      return DecorationSet.create(state.doc, [
        Decoration.widget(pos, () => {
          const parentNode = document.createElement('span');

          parentNode.innerHTML = suggestionText;
          parentNode.classList.add('sentence-suggestion');

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
          const { suggestionChoices, index } = currentState;
          const closeMetadata: SentenceCompletionMetadata = { type: 'close' };

          view.dispatch(
            view.state.tr
              .insertText(` ${suggestionChoices[index]}`)
              .setMeta(sentenceCompletionPluginKey, closeMetadata),
          );
        }
        return true;
      }
      if (event.code === 'Escape') {
        const closeMetadata: SentenceCompletionMetadata = { type: 'close' };

        view.dispatch(view.state.tr.setMeta(sentenceCompletionPluginKey, closeMetadata));
        return true;
      }
      return false;
    },
  },
  key: sentenceCompletionPluginKey,
});

export const SentenceCompletionExtension = Extension.create({
  name: 'SentenceCompletionExtension',

  addProseMirrorPlugins: () => [sentenceCompletionPlugin],

  addKeyboardShortcuts: () => ({ 'Mod-j': ({ editor }) => editor.commands.command(sentenceCompletionCommand) }),
});
