import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';

import { ReferenceListProps, ReferencesList } from './ReferencesList';

export const ReferenceNode = Mention.configure({
  renderLabel: ({ node }) => (node.attrs.label as string | undefined) ?? '[INVALID_REF]',
  suggestion: {
    allowSpaces: true,
    char: '[',
    allowedPrefixes: null,
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
