import './CommandPalette.css';

import { Command, CommandMenu, CommandWrapper, useCommands, useKmenu } from 'kmenu';
import { useEffect } from 'react';
import {
  VscBell,
  VscClose,
  VscEmptyWindow,
  VscExtensions,
  VscFiles,
  VscGear,
  VscLayoutSidebarLeft,
  VscLayoutSidebarRight,
  VscLibrary,
  VscMarkdown,
  VscNewFile,
  VscNewFolder,
  VscSave,
  VscSearch,
  VscSymbolString,
} from 'react-icons/vsc';
import { useEventListener } from 'usehooks-ts';

import { useActiveEditorId } from '../../atoms/hooks/useActiveEditorId';
import { emitEvent } from '../../events';
import { RewriteCommandWidgetMenu } from '../../features/ai/commands/RewriteCommandWidgetMenu';
import { ReferencesCommandMenu } from '../../features/references/commands/ReferencesCommandMenu';
import { INDEX_FILES, INDEX_MAIN, INDEX_REFERENCES, INDEX_REWRITE_WIDGET } from './CommandPaletteConfigs';
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

  // Open Files on "META + p"
  useEventListener('keydown', (e) => {
    if (e.metaKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      e.stopPropagation();
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
  const activeEditorId = useActiveEditorId();

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
      category: 'File',
      commands: [
        {
          icon: <VscMarkdown />,
          text: 'Save File as Markdown',
          perform: () => emitEvent('refstudio://menu/file/markdown'),
        },
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
          icon: <VscNewFolder />,
          text: 'New Project',
          perform: () => emitEvent('refstudio://menu/file/project/new'),
        },
        {
          icon: <VscEmptyWindow />,
          text: 'Open Project',
          perform: () => emitEvent('refstudio://menu/file/project/open'),
        },
        {
          icon: <VscClose />,
          text: 'Close Project',
          perform: () => emitEvent('refstudio://menu/file/project/close'),
        },
        {
          icon: <VscExtensions />,
          text: 'Open Sample Project',
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
          icon: <VscClose />,
          text: 'Close Editor',
          perform: () => emitEvent('refstudio://menu/file/close'),
        },
        {
          icon: <VscClose />,
          text: 'Close All Editors',
          perform: () => emitEvent('refstudio://menu/file/close/all'),
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
