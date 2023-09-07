import { useAtomValue } from 'jotai';
import { Command } from 'kmenu';
import { VscBell, VscFiles, VscGear, VscLayoutSidebarLeft, VscLayoutSidebarRight } from 'react-icons/vsc';

import { activePaneAtom } from '../../../atoms/editorActions';
import { useActiveEditorId } from '../../../atoms/hooks/useActiveEditorId';
import { isProjectOpenAtom } from '../../../atoms/projectState';
import { CloseIcon, OpenIcon } from '../../../components/icons';
import { emitEvent } from '../../../events';
import { AddIcon, SampleIcon } from '../../components/icons';
import { INDEX_FILES } from '../CommandPaletteConfigs';

export function useActionsCommands(openPanel: (panelIndex: number) => void): Command[] {
  const isProjectOpen = useAtomValue(isProjectOpenAtom);
  const activePaneId = useAtomValue(activePaneAtom).id;
  const activeEditorId = useActiveEditorId();

  const actionsCommands = [
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
    ...(isProjectOpen
      ? [
        {
          icon: <CloseIcon />,
          text: 'Close current project',
          perform: () => emitEvent('refstudio://menu/file/project/close'),
        },
      ]
      : []),
    {
      icon: <SampleIcon />,
      text: 'Open sample project...',
      perform: () => emitEvent('refstudio://menu/file/project/new/sample'),
    },
  ];

  if (isProjectOpen) {
    if (activeEditorId) {
      // Add move active editor action depending on the current active pane
      if (activePaneId === 'RIGHT') {
        actionsCommands.push({
          icon: <VscLayoutSidebarLeft />,
          text: 'Move Left',
          perform: () => {
            emitEvent('refstudio://editors/move', {
              fromPaneEditorId: { editorId: activeEditorId, paneId: 'RIGHT' },
              toPaneId: 'LEFT',
            });
          },
        });
      } else {
        actionsCommands.push({
          icon: <VscLayoutSidebarRight />,
          text: 'Move Right',
          perform: () => {
            emitEvent('refstudio://editors/move', {
              fromPaneEditorId: { editorId: activeEditorId, paneId: 'LEFT' },
              toPaneId: 'RIGHT',
            });
          },
        });
      }

      // Add close actions
      actionsCommands.push(
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
      );
    }

    // Add Quick Files action
    actionsCommands.push({
      icon: <VscFiles />,
      text: 'Quick Files...',
      perform: () => openPanel(INDEX_FILES),
    });
  }

  return [
    {
      category: 'Actions',
      commands: actionsCommands,
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
}
