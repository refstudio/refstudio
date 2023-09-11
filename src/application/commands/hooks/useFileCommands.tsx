import { useAtomValue } from 'jotai';
import { Command } from 'kmenu';
import { VscMarkdown, VscNewFile, VscSave } from 'react-icons/vsc';

import { useIsEditorOpen } from '../../../atoms/hooks/useIsEditorOpen';
import { isProjectOpenAtom } from '../../../atoms/projectState';
import { emitEvent } from '../../../events';

export function useFileCommands(): Command[] {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);
  const isRefStudioEditorOpen = useIsEditorOpen({ type: 'refstudio' });

  if (!isProjectOpen) {
    return [];
  }

  const fileCommands = [
    {
      icon: <VscNewFile />,
      text: 'New File',
      perform: () => emitEvent('refstudio://menu/file/new'),
    },
  ];

  if (isRefStudioEditorOpen) {
    fileCommands.push(
      {
        icon: <VscSave />,
        text: 'Save',
        perform: () => emitEvent('refstudio://menu/file/save'),
      },
      {
        icon: <VscMarkdown />,
        text: 'Save File as Markdown',
        perform: () => emitEvent('refstudio://menu/file/markdown'),
      },
    );
  }

  return [
    {
      category: 'File',
      commands: fileCommands,
    },
  ];
}
