import { useState } from 'react';
import { VscClose } from 'react-icons/vsc';

import { OpenAiSettingsPane } from '../features/ai/settings/OpenAiSettingsPane';
import { cx } from '../lib/cx';
import { DebugSettingsPane } from './panes/DebugSettingsPane';
import { GeneralSettingsPane } from './panes/GeneralSettingsPane';
import { initSettings } from './settingsManager';
import { PaneConfig, SettingsPanesConfig } from './types';

// Ensure settings are configured and loaded
await initSettings();

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
        id: 'project-general',
        title: 'General',
        Pane: GeneralSettingsPane,
      },
      {
        id: 'project-openai',
        title: 'Open AI',
        Pane: OpenAiSettingsPane,
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

export function SettingsModal({ open, onCloseClick }: { open: boolean; onCloseClick: () => void }) {
  const [pane, selectPane] = useState<PaneConfig>(
    SETTINGS_PANES.flatMap((e) => e.panes).find((p) => p.id === 'project-general')!,
  );

  if (!open) {
    return null;
  }

  return (
    <div className=" fixed left-0 top-0 z-[99999] flex h-screen w-screen items-center justify-center">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-slate-400/60" />
      <div
        className={cx(
          'relative h-[calc(100vh-300px)] w-[1150px] max-w-[calc(100vw-100px)] overflow-hidden',
          'rounded-xl border-none border-slate-500 bg-white shadow-xl shadow-slate-500',
          '',
        )}
      >
        <div className="flex h-full flex-row">
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
        </div>
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
      className={cx('-mx-6 cursor-pointer px-6 py-1 hover:font-semibold', {
        'bg-slate-200 font-semibold': active, //
      })}
      role="menuitem"
      onClick={() => onClick(pane)}
    >
      {text}
    </div>
  );
}
