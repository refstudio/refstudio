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

import { emitEvent } from '../events';
import { FilesCommandMenu } from './FilesCommandMenu';
import { ReferencesCommandMenu } from './ReferencesCommandMenu';
import { RewriteCommand2Menu } from './RewriteCommand2Menu';
import { RewriteCommandMenu } from './RewriteCommandMenu';
import { RewriteCommandMultiMenu } from './RewriteCommandMultiMenu';
import { RewriteCommandWidgetMenu } from './RewriteCommandWidgetMenu';

const INDEX_MAIN = 1;
const INDEX_REFERENCES = 2;
const INDEX_FILES = 3;
const INDEX_REWRITE = 4;
const INDEX_REWRITE2 = 5;
const INDEX_REWRITE3 = 40;
const INDEX_REWRITE4 = 50;

export function CommandPalette({ index }: { index?: number }) {
  const { setOpen } = useKmenu();

  // Allow to select open menu (index)
  useEffect(() => {
    if (index !== undefined) {
      setOpen(index);
    }
  }, [index, setOpen]);

  // Open Files on META+p
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
        <RewriteCommandMenu index={INDEX_REWRITE} />
        <RewriteCommand2Menu index={INDEX_REWRITE2} />
        <RewriteCommandWidgetMenu index={INDEX_REWRITE3} />
        <RewriteCommandMultiMenu index={INDEX_REWRITE4} />
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
          perform: () => setOpen(INDEX_REWRITE, true),
        },
        {
          icon: <VscSymbolString />,
          text: 'Rewrite selection (menus)...',
          perform: () => setOpen(INDEX_REWRITE4, true),
        },
        {
          icon: <VscSymbolString />,
          text: 'Rewrite selection (widget)...',
          perform: () => setOpen(INDEX_REWRITE3, true),
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
