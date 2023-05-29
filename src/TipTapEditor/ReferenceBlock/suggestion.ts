import { MentionOptions } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';
import tippy from 'tippy.js';

import { ReferencesList, ReferencesListProps } from './ReferencesList';

export const suggestion: MentionOptions['suggestion'] = {
  items: ({ query }) =>
    ['ref1', 'ref2']
      .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
      .map((item) => ({ id: item }))
      .slice(0, 5),

  render: () => {
    let component: ReactRenderer<{ onKeyDown: (e: SuggestionKeyDownProps) => boolean }, ReferencesListProps>;
    let popup: ReturnType<typeof tippy>;

    return {
      onStart: (props) => {
        component = new ReactRenderer<{ onKeyDown: (e: SuggestionKeyDownProps) => boolean }, ReferencesListProps>(
          ReferencesList,
          {
            props,
            editor: props.editor,
          },
        );

        if (!props.clientRect) {
          return;
        }

        // eslint-disable-next-line
        // @ts-ignore
        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      // onUpdate(_props) {},

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide();

          return true;
        }

        return component.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
