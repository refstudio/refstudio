import { useAtomValue } from 'jotai';
import { Command } from 'kmenu';
import { useMemo } from 'react';

import { useIsEditorOpen } from '../../../atoms/hooks/useIsEditorOpen';
import { isProjectOpenAtom } from '../../../atoms/projectState';
import { emitEvent } from '../../../events';
import { MagicIcon } from '../../components/icons';
import { BotIcon, PenIcon } from '../../sidebar/icons';

export function useAiCommands(): Command[] {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);
  const isRefStudioEditorOpen = useIsEditorOpen({ type: 'refstudio' });

  const aiCommands = useMemo(() => {
    if (!isProjectOpen) {
      return [];
    }

    const commands = [];

    if (isRefStudioEditorOpen) {
      commands.push(
        {
          icon: <MagicIcon />,
          text: 'Complete phrase for me...',
          perform: () => emitEvent('refstudio://ai/suggestion/suggest'),
        },
        {
          icon: <PenIcon />,
          text: 'Rewrite selection...',
          perform: () => emitEvent('refstudio://sidebars/open', { panel: 'Rewriter' }),
        },
      );
    }

    commands.push({
      icon: <BotIcon />,
      text: 'Talk with references...',
      perform: () => emitEvent('refstudio://sidebars/open', { panel: 'Chatbot' }),
    });

    return commands;
  }, [isRefStudioEditorOpen, isProjectOpen]);

  return useMemo(() => [{ category: 'AI', commands: aiCommands }], [aiCommands]);
}
