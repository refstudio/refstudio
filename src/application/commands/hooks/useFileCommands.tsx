import { useAtomValue } from 'jotai';
import { Command } from 'kmenu';
import { VscMarkdown, VscNewFile, VscSave } from 'react-icons/vsc';

import { useActiveEditorId } from '../../../atoms/hooks/useActiveEditorId';
import { isProjectOpenAtom } from '../../../atoms/projectState';
import { parseEditorId } from '../../../atoms/types/EditorData';
import { emitEvent } from '../../../events';

export function useFileCommands(): Command[] {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);
  const activeEditorId = useActiveEditorId();

  if (!isProjectOpen) {
    return [];
  }

  const fileCommands = [
    {
      icon: <VscNewFile />,
      text: 'New File',
      perform: () => emitEvent('refstudio://menu/file/new'),
    },
    {
      icon: <VscSave />,
      text: 'Save',
      perform: () => emitEvent('refstudio://menu/file/save'),
    },
  ];

  if (activeEditorId && parseEditorId(activeEditorId).type === 'refstudio') {
    fileCommands.push({
      icon: <VscMarkdown />,
      text: 'Save File as Markdown',
      perform: () => emitEvent('refstudio://menu/file/markdown'),
    });
  }

  return [
    {
      category: 'File',
      commands: fileCommands,
    },
  ];
}
