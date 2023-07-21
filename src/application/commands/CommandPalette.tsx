import './CommandPalette.css';

import { Command, CommandMenu, CommandWrapper, useCommands, useKmenu } from 'kmenu';
import { useEffect } from 'react';
import {
  VscBell,
  VscClose,
  VscFiles,
  VscGear,
  VscLibrary,
  VscNewFile,
  VscSearch,
  VscSymbolString,
} from 'react-icons/vsc';
import { useEventListener } from 'usehooks-ts';

import { emitEvent } from '../../events';
import { RewriteCommandWidgetMenu } from '../../features/ai/commands/RewriteCommandWidgetMenu';
import { ReferencesCommandMenu } from '../../features/references/commands/ReferencesCommandMenu';
import { INDEX_FILES, INDEX_MAIN, INDEX_REFERENCES, INDEX_REWRITE_WIDGET } from './CommandPaletteConfigs';
import { FilesCommandMenu } from './FilesCommandMenu';

export function CommandPalette({ index }: { index?: number }) {
  const { setOpen } = useKmenu();

  // Open a menu by default (usefull for tests)
  useEffect(() => {
    if (index !== undefined) {
      setOpen(index);
    }
  }, [index, setOpen]);

  // Open Files on "META + p"
  useEventListener('keydown', (e) => {
    if (e.metaKey && e.key.toLowerCase() === 'p') {
      setOpen(INDEX_FILES, true);
    }
  });

  return (
    <div className="command-palette" data-testid={CommandPalette.name}>
      <CommandWrapper>
        <MainCommandMenu index={INDEX_MAIN} />
        <ReferencesCommandMenu index={INDEX_REFERENCES} />
        <FilesCommandMenu index={INDEX_FILES} />
        <RewriteCommandWidgetMenu index={INDEX_REWRITE_WIDGET} />
      </CommandWrapper>
    </div>
  );
}

export function MainCommandMenu({ index }: { index: number }) {
  const { setOpen } = useKmenu();

  const main: Command[] = [
    {
      category: 'AI',
      commands: [
        {
          icon: <VscSymbolString />,
          text: 'Rewrite selection...',
          perform: () => setOpen(INDEX_REWRITE_WIDGET, true),
        },
      ],
    },
    {
      category: 'References',
      commands: [
        {
          icon: <VscSearch />,
          text: 'Find References...',
          perform: () => setOpen(INDEX_REFERENCES, true),
        },
        {
          icon: <VscLibrary />,
          text: 'Show References',
          perform: () => emitEvent('refstudio://menu/references/open'),
        },
        {
          icon: <VscNewFile />,
          text: 'Upload References',
          perform: () => emitEvent('refstudio://menu/references/upload'),
        },
      ],
    },
    {
      category: 'Actions',
      commands: [
        {
          icon: <VscNewFile />,
          text: 'New File',
          perform: () => emitEvent('refstudio://menu/file/new'),
        },
        {
          icon: <VscClose />,
          text: 'Close Active Editor',
          perform: () => emitEvent('refstudio://menu/file/close'),
        },
        {
          icon: <VscFiles />,
          text: 'Open File...',
          perform: () => setOpen(INDEX_FILES, true),
        },
      ],
      // Commands that aren't visible to the user (only after search)
      subCommands: [
        {
          icon: <VscBell />,
          text: 'Show Notifications',
          perform: () => emitEvent('refstudio://menu/view/notifications'),
        },
        {
          icon: <VscGear />,
          text: 'Show Settings',
          perform: () => emitEvent('refstudio://menu/settings'),
        },
      ],
    },
  ];

  const [mainCommands] = useCommands(main);

  return <CommandMenu commands={mainCommands} crumbs={[]} index={index} placeholder="Search commands" />;
}
