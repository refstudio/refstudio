import { register, unregister } from '@tauri-apps/api/globalShortcut';
import { useEffect, useState } from 'react';
import { VscClose } from 'react-icons/vsc';

import { JSONDebug, JSONDebugContainer } from '../components/JSONDebug';
import { cx } from '../cx';
import { useCallablePromise } from '../hooks/useCallablePromise';
import { getSettings, initSettings, setSettings } from './settings';

// Tauri HOTKEYS
// https://github.com/tauri-apps/global-hotkey/blob/0b91f4beb998526103447d890ed8eeddc0397b7d/src/hotkey.rs#L164
const SETTINGS_SHORTCUT_TOGGLE = 'Cmd+,';
const SETTINGS_SHORTCUT_CLOSE = 'Esc'; // 'Shift+Esc';

type SettingsPaneId = 'user-account' | 'project-general' | 'project-openai' | 'debug';
interface PaneConfig {
  id: SettingsPaneId;
  title: string;
  Pane: React.FC<{ config: PaneConfig }>;
}

interface SettingsPanesConfig {
  section: string;
  bottom?: boolean;
  hidden?: boolean;
  panes: PaneConfig[];
}

const SETTINGS_PANES: SettingsPanesConfig[] = [
  {
    section: 'User',
    panes: [
      {
        id: 'user-account',
        title: 'User Account',
        Pane: ToDoSettingsPane,
      },
    ],
  },
  {
    section: 'Project',
    panes: [
      {
        id: 'project-general',
        title: 'General',
        Pane: ToDoSettingsPane,
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

// Ensure settings are configured and loaded
await initSettings();

export function SettingsModal({ open = false, onToggle }: { open?: boolean; onToggle(open: boolean): void }) {
  const [pane, selectPane] = useState<PaneConfig>(
    SETTINGS_PANES.flatMap((e) => e.panes).find((p) => p.id === 'project-openai')!,
  );

  useEffect(() => {
    (async function runAsync() {
      try {
        await unregister(SETTINGS_SHORTCUT_TOGGLE);
        await unregister(SETTINGS_SHORTCUT_CLOSE);
        await register(SETTINGS_SHORTCUT_TOGGLE, () => onToggle(!open));
        await register(SETTINGS_SHORTCUT_CLOSE, () => onToggle(false));
      } catch (err) {
        console.error('Cannot register settings shortcut:', err);
      }
    })();
  }, [onToggle, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center">
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
              <div className={cx('space-y-1', { '!mt-auto': paneSection.bottom })} key={paneSection.section}>
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
              onClick={() => onToggle(false)}
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
      onClick={() => onClick(pane)}
    >
      {text}
    </div>
  );
}

function SettingsPane({
  header,
  description = '',
  children,
}: {
  header: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <strong className="block border-b-2 border-b-slate-200 pb-1 text-2xl">{header}</strong>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </div>
  );
}

interface SettingsPaneProps {
  config: PaneConfig;
}

function ToDoSettingsPane({ config }: SettingsPaneProps) {
  return (
    <SettingsPane header={String(config.title).toUpperCase()}>
      <em>TODO</em>
    </SettingsPane>
  );
}

function DebugSettingsPane({ config }: SettingsPaneProps) {
  return (
    <SettingsPane header={config.title}>
      <pre className="text-xs">{JSON.stringify(getSettings().default, null, 2)}</pre>
    </SettingsPane>
  );
}

function OpenAiSettingsPane({ config }: SettingsPaneProps) {
  const [paneSettings, setPaneSettings] = useState(getSettings().getCache('openAI'));
  const [result, callSetSettings] = useCallablePromise(setSettings);

  function handleSaveSettings(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    callSetSettings('openAI', paneSettings);
  }

  const isDirty = JSON.stringify(paneSettings) !== JSON.stringify(getSettings().getCache('openAI'));

  return (
    <SettingsPane
      description="You need to configure the API to use the rewrite and chat operations."
      header={config.title}
    >
      <form className="mt-10" onSubmit={handleSaveSettings}>
        <fieldset className="space-y-4">
          <div>
            <label>API Key</label>
            <input
              className="w-full border px-2 py-0.5"
              value={paneSettings.apiKey}
              onChange={(e) => setPaneSettings({ ...paneSettings, apiKey: e.currentTarget.value })}
            />
          </div>
          <div>
            <label>Chat Model</label>
            <input
              className="w-full border px-2 py-0.5"
              value={paneSettings.chatModel}
              onChange={(e) => setPaneSettings({ ...paneSettings, chatModel: e.currentTarget.value })}
            />
          </div>
          <div>
            <label>Complete Model</label>
            <input
              className="w-full border px-2 py-0.5"
              value={paneSettings.completeModel}
              onChange={(e) => setPaneSettings({ ...paneSettings, completeModel: e.currentTarget.value })}
            />
          </div>
        </fieldset>
        <fieldset className="mt-10 flex justify-end">
          <input className="btn-primary" disabled={!isDirty || result.state === 'loading'} type="submit" value="SAVE" />
        </fieldset>
      </form>

      <JSONDebugContainer className="mt-28">
        <JSONDebug header="paneSettings" value={paneSettings} />
        <JSONDebug header="API call result" value={result} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}
