import './CommandPalette.css';

import { Command, CommandMenu, CommandWrapper, useCommands, useKmenu } from 'kmenu';
import { useCallback, useEffect, useMemo } from 'react';

import { ReferencesCommandMenu } from '../../features/references/commands/ReferencesCommandMenu';
import { useRefStudioHotkeys } from '../../hooks/useRefStudioHotkeys';
import { INDEX_FILES, INDEX_MAIN, INDEX_REFERENCES } from './CommandPaletteConfigs';
import { FilesCommandMenu } from './FilesCommandMenu';
import { useActionsCommands } from './hooks/useActionsCommands';
import { useAiCommands } from './hooks/useAiCommands';
import { useFileCommands } from './hooks/useFileCommands';
import { useReferencesCommands } from './hooks/useReferencesCommands';

export function CommandPalette({ index, onOpen }: { index?: number; onOpen?: (index: number) => void }) {
  const { setOpen, open } = useKmenu();

  // Open a menu by default (usefull for tests)
  useEffect(() => {
    if (index !== undefined) {
      setOpen(index);
    }
  }, [index, setOpen]);

  // Notify externally that a menu was opened (usefull for tests)
  useEffect(() => {
    onOpen?.(open);
  }, [onOpen, open]);

  useRefStudioHotkeys(['meta+p'], () => setOpen(INDEX_FILES, true));

  return (
    <div className="command-palette" data-testid={CommandPalette.name}>
      <CommandWrapper>
        <MainCommandMenu index={INDEX_MAIN} />
        <ReferencesCommandMenu index={INDEX_REFERENCES} />
        <FilesCommandMenu index={INDEX_FILES} />
      </CommandWrapper>
    </div>
  );
}

export function MainCommandMenu({ index }: { index: number }) {
  const { setOpen } = useKmenu();

  const openPanel = useCallback((panelIndex: number) => setOpen(panelIndex, true), [setOpen]);

  const aiCommands = useAiCommands();
  const referencesCommands = useReferencesCommands(openPanel);
  const fileCommands = useFileCommands();
  const actionsCommands = useActionsCommands(openPanel);

  const main: Command[] = useMemo(
    () => [...aiCommands, ...referencesCommands, ...fileCommands, ...actionsCommands],
    [aiCommands, referencesCommands, fileCommands, actionsCommands],
  );

  const [mainCommands] = useCommands(main);

  return <CommandMenu commands={mainCommands} crumbs={[]} index={index} placeholder="Search commands or actions..." />;
}
