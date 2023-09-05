import { useState } from 'react';

import { Modal } from '../components/Modal';
import { OpenAiSettingsPane } from '../features/ai/settings/OpenAiSettingsPane';
import { cx } from '../lib/cx';
import { DebugSettingsPane } from './panes/DebugSettingsPane';
import { LoggingSettingsPane } from './panes/LoggingSettingsPane';
import { PaneConfig, SettingsPanesConfig } from './types';

const SETTINGS_PANES: SettingsPanesConfig[] = [
  // {
  //   section: 'User',
  //   panes: [
  //     {
  //       id: 'user-account',
  //       title: 'User Account',
  //       Pane: ToDoSettingsPane,
  //     },
  //   ],
  // },
  {
    section: 'Project',
    panes: [
      {
        id: 'project-openai',
        title: 'Open AI',
        Pane: OpenAiSettingsPane,
      },
      {
        id: 'project-logging',
        title: 'Logging',
        Pane: LoggingSettingsPane,
      },
    ],
  },
  {
    section: 'Debug',
    bottom: true,
    hidden: !import.meta.env.DEV,
    panes: [
      {
        id: 'debug',
        title: 'Config',
        Pane: DebugSettingsPane,
      },
    ],
  },
];

export function SettingsModal({ open, onClose: onClose }: { open: boolean; onClose: () => void }) {
  const [pane, selectPane] = useState<PaneConfig>(SETTINGS_PANES[0].panes[0]);

  return (
    <Modal className="h-[37.5rem] w-[50rem]" open={open} onClose={onClose}>
      <div
        className={cx(
          'flex w-40 shrink-0 flex-col items-stretch gap-2 bg-modal-bg-secondary px-2 py-6',
          'cursor-default select-none',
        )}
      >
        {SETTINGS_PANES.filter((s) => !s.hidden).map((paneSection) => (
          <div className={cx('flex flex-col gap-2', { 'mt-auto': paneSection.bottom })} key={paneSection.section}>
            <h1 className="px-2 text-modal-txt-primary" role="menuitem">
              {paneSection.section}
            </h1>
            {paneSection.panes.map((paneConfig) => (
              <SettingsMenuItem
                activePane={pane}
                key={paneConfig.id}
                pane={paneConfig}
                text={paneConfig.title}
                onClick={selectPane}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex-1 bg-modal-bg-primary">
        <pane.Pane config={pane} />
      </div>
    </Modal>
  );
}

function SettingsMenuItem({
  onClick,
  activePane,
  pane,
  text,
}: {
  pane: PaneConfig;
  activePane: PaneConfig;
  onClick(pane: PaneConfig): void;
  text: string;
}) {
  const active = pane === activePane;
  return (
    <div
      className={cx('flex cursor-pointer items-center gap-1 rounded-default px-2 py-1', {
        'bg-btn-bg-side-bar-item-active': active,
        'hover:bg-btn-bg-side-bar-item-hover': !active,
      })}
      role="menuitem"
      onClick={() => onClick(pane)}
    >
      <div className="line-clamp-1 flex-1 overflow-ellipsis text-btn-txt-side-bar-item-primary">{text}</div>
    </div>
  );
}
