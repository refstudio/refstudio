import Mention from '@tiptap/extension-mention';
import { ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react';
import { SuggestionKeyDownProps, SuggestionOptions } from '@tiptap/suggestion';

import { Reference } from './Reference';
import { ReferenceListProps, ReferencesList } from './ReferencesList';

export const referenceNode = Mention.extend({
  name: 'reference',
  addNodeView: () => ReactNodeViewRenderer(Reference),
}).configure({
  suggestion: {
    allowSpaces: true,
    char: '@',
    allowedPrefixes: null,
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
            type: referenceNode.name,
            attrs: props,
          },
        ])
        .run();
    },
    render: () => {
      let reactRenderer: ReactRenderer<{ onKeyDown: (e: SuggestionKeyDownProps) => boolean }, ReferenceListProps>;

      return {
        onStart: (props) => {
          reactRenderer = new ReactRenderer<{ onKeyDown: (e: SuggestionKeyDownProps) => boolean }, ReferenceListProps>(
            ReferencesList,
            {
              props,
              editor: props.editor,
            },
          );
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
