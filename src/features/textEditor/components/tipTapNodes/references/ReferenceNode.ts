import Mention from '@tiptap/extension-mention';
import { TextSelection } from '@tiptap/pm/state';
import { InputRule, ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react';
import { SuggestionKeyDownProps, SuggestionOptions } from '@tiptap/suggestion';

import { Reference } from './Reference';
import { ReferenceListPopupProps, ReferencesListPopup } from './ReferencesListPopup';

export const ReferenceNode = Mention.extend({
  name: 'reference',
  addNodeView: () => ReactNodeViewRenderer(Reference),
  addAttributes: () => ({
    id: {
      default: null,
      parseHTML: (element) => element.getAttribute('data-id'),
      renderHTML: (attributes) => {
        if (!attributes.id || typeof attributes.id !== 'string') {
          return {};
        }

        return {
          'data-id': attributes.id,
        };
      },
    },
  }),
  addInputRules: () => [
    new InputRule({
      find: /[[]$/,
      handler: ({ state, range }) => {
        const { tr } = state;
        const start = range.from;

        tr.delete(start, start + 1)
          .insert(start, state.schema.text('[@]'))
          .setSelection(TextSelection.create(tr.doc, state.selection.from + 2));
      },
    }),
  ],
}).configure({
  suggestion: {
    allowSpaces: true,
    char: '@',
    allowedPrefixes: null,
    /* c8 ignore start */
    command: ({
      editor,
      range,
      props,
    }: Parameters<Exclude<SuggestionOptions<{ id: string }>['command'], undefined>>[0]) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: ReferenceNode.name,
            attrs: props,
          },
        ])
        .command(({ dispatch, tr }) => {
          if (tr.doc.textBetween(range.from + 1, range.from + 2)) {
            tr.setSelection(TextSelection.create(tr.doc, range.from + 2));
          }
          if (dispatch) {
            dispatch(tr);
          }
          return true;
        })
        .run();
    },
    /* c8 ignore stop */

    render: () => {
      let reactRenderer: ReactRenderer<{ onKeyDown: (e: SuggestionKeyDownProps) => boolean }, ReferenceListPopupProps>;

      return {
        onStart: (props) => {
          reactRenderer = new ReactRenderer<
            { onKeyDown: (e: SuggestionKeyDownProps) => boolean },
            ReferenceListPopupProps
          >(ReferencesListPopup, {
            props,
            editor: props.editor,
          });
        },

        onUpdate: (props) => {
          reactRenderer.updateProps(props);
        },

        onKeyDown: (props) => {
          if (props.event.key === 'Escape') {
            reactRenderer.destroy();
            return true;
          }

          return reactRenderer.ref?.onKeyDown(props) ?? false;
        },

        onExit: () => {
          reactRenderer.destroy();
        },
      };
    },
  },
});
