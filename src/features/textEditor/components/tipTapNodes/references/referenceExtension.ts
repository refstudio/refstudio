import { ReactRenderer } from '@tiptap/react';
import { SuggestionKeyDownProps, SuggestionOptions } from '@tiptap/suggestion';

import { referencesMark } from './citationMark';
import { referencePlugin } from './referencePlugin';
import { ReferenceListProps, ReferencesList } from './ReferencesList';

export const referenceExtension = referencePlugin.configure({
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
            type: referenceExtension.name,
            attrs: props,
            marks: [{ type: referencesMark.name }],
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
