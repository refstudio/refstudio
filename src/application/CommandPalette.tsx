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

import { emitEvent } from '../events';
import { FilesCommandMenu } from './FilesCommandMenu';
import { ReferencesCommandMenu } from './ReferencesCommandMenu';
import { RewriteCommand2Menu } from './RewriteCommand2Menu';
import { RewriteCommandMenu } from './RewriteCommandMenu';

const INDEX_MAIN = 1;
const INDEX_REFERENCES = 2;
const INDEX_FILES = 3;
const INDEX_REWRITE = 4;
const INDEX_REWRITE2 = 5;

export function CommandPalette({ index }: { index?: number }) {
  const { setOpen } = useKmenu();

  // Allow to select open menu (index)
  useEffect(() => {
    if (index !== undefined) {
      setOpen(index);
    }
  }, [index, setOpen]);

  useShortcut({
    modifier: 'meta',
    targetKey: 'p',
    handler: () => {
      setOpen(INDEX_FILES);
    },
  });

  return (
    <div className="command-palette" data-testid={CommandPalette.name}>
      <CommandWrapper>
        <MainCommandMenu index={INDEX_MAIN} />
        <ReferencesCommandMenu index={INDEX_REFERENCES} />
        <RewriteCommandMenu index={INDEX_REWRITE} />
        <FilesCommandMenu index={INDEX_FILES} />
        <RewriteCommand2Menu index={INDEX_REWRITE2} />
      </CommandWrapper>
    </div>
  );
}

export function MainCommandMenu({ index }: { index: number }) {
  const { setOpen } = useKmenu();

  const main: Command[] = [
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
          text: 'Rewrite selection (2)...',
          perform: () => setOpen(INDEX_REWRITE2, true),
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
      category: 'Files',
      commands: [
        {
          icon: <VscFiles />,
          text: 'Open File...',
          perform: () => setOpen(INDEX_FILES, true),
        },
      ],
    },
  ];

  const [mainCommands] = useCommands(main);

  return <CommandMenu commands={mainCommands} crumbs={[]} index={index} placeholder="Search commands" />;
}
