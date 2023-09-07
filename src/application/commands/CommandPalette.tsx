import './CommandPalette.css';

import { useAtomValue } from 'jotai';
import { Command, CommandMenu, CommandWrapper, useCommands, useKmenu } from 'kmenu';
import { useEffect } from 'react';
import {
  VscBell,
  VscFiles,
  VscGear,
  VscLayoutSidebarLeft,
  VscLayoutSidebarRight,
  VscMarkdown,
  VscNewFile,
  VscSave,
} from 'react-icons/vsc';

import { useActiveEditorId } from '../../atoms/hooks/useActiveEditorId';
import { selectionAtom } from '../../atoms/selectionState';
import { parseEditorId } from '../../atoms/types/EditorData';
import { CloseIcon, OpenIcon, SearchIcon } from '../../components/icons';
import { emitEvent } from '../../events';
import { ReferencesCommandMenu } from '../../features/references/commands/ReferencesCommandMenu';
import { useRefStudioHotkeys } from '../../hooks/useRefStudioHotkeys';
import { AddIcon, MagicIcon, SampleIcon } from '../components/icons';
import { BotIcon, PenIcon, ReferencesIcon } from '../sidebar/icons';
import { INDEX_FILES, INDEX_MAIN, INDEX_REFERENCES } from './CommandPaletteConfigs';
import { FilesCommandMenu } from './FilesCommandMenu';

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
  const activeEditorId = useActiveEditorId();
  const selection = useAtomValue(selectionAtom);

  const aiCommands = [];

  if (activeEditorId && parseEditorId(activeEditorId).type === 'refstudio') {
    aiCommands.push({
      icon: <MagicIcon />,
      text: 'Complete phrase for me...',
      // TODO: perform: () => setOpen(INDEX_REWRITE_WIDGET, true),
    });
  }

  if (selection.length > 0) {
    aiCommands.push({
      icon: <PenIcon />,
      text: 'Rewrite selection...',
      perform: () => emitEvent('refstudio://sidebars/open', { panel: 'Rewriter' }),
    });
  }

  aiCommands.push({
    icon: <BotIcon />,
    text: 'Talk with references...',
    perform: () => emitEvent('refstudio://sidebars/open', { panel: 'Chatbot' }),
  });

  const main: Command[] = [
    {
      category: 'AI',
      commands: aiCommands,
    },
    {
      category: 'References',
      commands: [
        {
          icon: <SearchIcon />,
          text: 'Find References...',
          perform: () => setOpen(INDEX_REFERENCES, true),
        },
        {
          icon: <ReferencesIcon />,
          text: 'Show References',
          perform: () => emitEvent('refstudio://menu/references/open'),
        },
        {
          icon: <AddIcon />,
          text: 'Upload References',
          perform: () => emitEvent('refstudio://menu/references/upload'),
        },
      ],
    },
    {
      category: 'File',
      commands: [
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
        {
          icon: <VscMarkdown />,
          text: 'Save File as Markdown',
          perform: () => emitEvent('refstudio://menu/file/markdown'),
        },
        {
          icon: <AddIcon />,
          text: 'New project...',
          perform: () => emitEvent('refstudio://menu/file/project/new'),
        },
        {
          icon: <OpenIcon />,
          text: 'Open project...',
          perform: () => emitEvent('refstudio://menu/file/project/open'),
        },
        {
          icon: <CloseIcon />,
          text: 'Close current project',
          perform: () => emitEvent('refstudio://menu/file/project/close'),
        },
        {
          icon: <SampleIcon />,
          text: 'Open sample project...',
          perform: () => emitEvent('refstudio://menu/file/project/new/sample'),
        },
      ],
    },
    {
      category: 'Actions',
      commands: [
        {
          icon: <VscLayoutSidebarLeft />,
          text: 'Move Left',
          perform: () => {
            if (activeEditorId) {
              emitEvent('refstudio://editors/move', {
                fromPaneEditorId: { editorId: activeEditorId, paneId: 'RIGHT' },
                toPaneId: 'LEFT',
              });
            }
          },
        },
        {
          icon: <VscLayoutSidebarRight />,
          text: 'Move Right',
          perform: () => {
            if (activeEditorId) {
              emitEvent('refstudio://editors/move', {
                fromPaneEditorId: { editorId: activeEditorId, paneId: 'LEFT' },
                toPaneId: 'RIGHT',
              });
            }
          },
        },
        {
          icon: <CloseIcon />,
          text: 'Close Editor',
          perform: () => emitEvent('refstudio://menu/file/close'),
        },
        {
          icon: <CloseIcon />,
          text: 'Close All Editors',
          perform: () => emitEvent('refstudio://menu/file/close/all'),
        },
        {
          icon: <VscFiles />,
          text: 'Quick Files...',
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

  return <CommandMenu commands={mainCommands} crumbs={[]} index={index} placeholder="Search commands or actions..." />;
}
