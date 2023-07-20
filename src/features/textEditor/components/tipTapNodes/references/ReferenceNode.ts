import Mention from '@tiptap/extension-mention';
import { ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react';
import { SuggestionKeyDownProps, SuggestionOptions } from '@tiptap/suggestion';

import { CitationNode } from '../citation/CitationNode';
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
}).configure({
  suggestion: {
    allowSpaces: true,
    char: '@',
    allowedPrefixes: null,
    allow: ({ state, range }) =>
      state.selection.empty && state.doc.resolve(range.from).parent.type.name === CitationNode.name,
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
