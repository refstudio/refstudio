import { useState } from 'react';

import { OpenAiSettingsPane } from '../features/ai/settings/OpenAiSettingsPane';
import { useRefStudioHotkeys } from '../hooks/useRefStudioHotkeys';
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


  useRefStudioHotkeys(['escape'], () => {
    if (open) {
      onClose();
    }
  });

  if (!open) {
    return null;
  }

  return (
    <div
      className={cx(
        'cursor-default select-none',
        'fixed left-0 top-0 z-modals flex h-screen w-screen items-center justify-center',
        'bg-modal-bg-overlay bg-opacity-[0.32]',
      )}
      onClick={onClose}
    >
      <div
        className={cx('flex h-[37.5rem] w-[50rem] items-stretch overflow-hidden', 'rounded-modal shadow-default')}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div
          className={cx(
            'flex w-40 shrink-0 flex-col items-stretch gap-2 bg-modal-bg-secondary px-2 py-6',
            'cursor-default select-none',
          )}
        >
          {SETTINGS_PANES.filter((s) => !s.hidden).map((paneSection) => (
            <div className={cx('flex flex-col gap-2', { 'mt-auto': paneSection.bottom })} key={paneSection.section}>
              <h1 className="text-modal-txt-primary px-2">{paneSection.section}</h1>
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
        {/* <div className="flex h-full flex-row">
          <div className="flex w-52 flex-col space-y-10 bg-slate-100 p-6">
            {SETTINGS_PANES.filter((s) => !s.hidden).map((paneSection) => (
              <div
                className={cx('space-y-1', { '!mt-auto': paneSection.bottom })}
                key={paneSection.section}
                role="menu"
              >
                <strong className="uppercase">{paneSection.section}</strong>
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
          <div className="relative h-full w-full overflow-auto p-6">
            <VscClose
              className="absolute right-2 top-2 cursor-pointer rounded-lg p-1 hover:bg-slate-200"
              size={30}
              title="close"
              onClick={onCloseClick}
            />
            <pane.Pane config={pane} />
          </div>
        </div> */}
      </div>
    </div>
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
