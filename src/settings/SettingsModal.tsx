import { useCallback, useState } from 'react';
import { VscClose } from 'react-icons/vsc';

import { JSONDebug, JSONDebugContainer } from '../components/JSONDebug';
import { cx } from '../cx';
import { listenEvent, RefStudioEvents } from '../events';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { useCallablePromise } from '../hooks/useCallablePromise';
import { flushCachedSettings, getCachedSetting, getSettings, initSettings, setCachedSetting } from './settings';

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
    hidden: true,
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

// Ensure settings are configured and loaded
await initSettings();

export function SettingsModal({ defaultOpen }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen === true);

  const [pane, selectPane] = useState<PaneConfig>(
    SETTINGS_PANES.flatMap((e) => e.panes).find((p) => p.id === 'project-general')!,
  );

  const listenSettingsMenuEvent = useCallback(
    (isMounted: () => boolean) =>
      listenEvent(RefStudioEvents.Menu.settings, () => {
        if (isMounted()) {
          setOpen(!open);
        }
      }),
    [open, setOpen],
  );

  useAsyncEffect(listenSettingsMenuEvent, (unregister) => unregister?.());

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
              onClick={() => setOpen(false)}
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
      <JSONDebugContainer>
        <JSONDebug header="DEFAULT SETTINGS" value={getSettings().default} />
        <JSONDebug header="CURRENT SETTINGS" value={getSettings()} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}

function GeneralSettingsPane({ config }: SettingsPaneProps) {
  const [projectSettings, setProjectSettings] = useState(getCachedSetting('project'));
  const [sidecarLoggingSettings, setSidecarLoggingSettings] = useState(getCachedSetting('sidecar.logging'));

  const saveSettings = useCallback(
    async (project: typeof projectSettings, sidecarLogging: typeof sidecarLoggingSettings) => {
      setCachedSetting('project', project);
      setCachedSetting('sidecar.logging', sidecarLogging);
      await flushCachedSettings();
      return getSettings();
    },
    [],
  );

  const [result, callSetSettings] = useCallablePromise(saveSettings);

  function handleSaveSettings(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    callSetSettings(projectSettings, sidecarLoggingSettings);
  }

  const isDirty =
    JSON.stringify(projectSettings) !== JSON.stringify(getCachedSetting('project')) ||
    JSON.stringify(sidecarLoggingSettings) !== JSON.stringify(getCachedSetting('sidecar.logging'));

  return (
    <SettingsPane
      description="You need to configure the API to use the rewrite and chat operations."
      header={config.title}
    >
      <form className="mt-10" onSubmit={handleSaveSettings}>
        <fieldset className="space-y-4">
          <div className="space-y-2">
            <label className="font-semibold">Project Name</label>
            <input
              className="w-full border px-2 py-0.5"
              readOnly
              value={projectSettings.name}
              onChange={(e) => setProjectSettings({ ...projectSettings, name: e.currentTarget.value })}
            />
            <p className="text-xs text-gray-500">NOTE: This setting is readonly (for now!)</p>
          </div>
          <div className="space-y-2">
            <label className="font-semibold">Sidecar Logging Active</label>
            <input
              checked={sidecarLoggingSettings.active}
              className="w-full border px-2 py-0.5"
              type="checkbox"
              onChange={(e) =>
                setSidecarLoggingSettings({ ...sidecarLoggingSettings, active: e.currentTarget.checked })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="font-semibold">Complete Model</label>
            <input
              className="w-full border px-2 py-0.5"
              value={sidecarLoggingSettings.path}
              onChange={(e) => setSidecarLoggingSettings({ ...sidecarLoggingSettings, path: e.currentTarget.value })}
            />
          </div>
        </fieldset>
        <fieldset className="mt-10 flex justify-end">
          <input className="btn-primary" disabled={!isDirty || result.state === 'loading'} type="submit" value="SAVE" />
        </fieldset>
      </form>

      <JSONDebugContainer className="mt-28">
        <JSONDebug header="paneSettings" value={projectSettings} />
        <JSONDebug header="sidecarLogging" value={sidecarLoggingSettings} />
        <JSONDebug header="API call result" value={result} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}

function OpenAiSettingsPane({ config }: SettingsPaneProps) {
  const [paneSettings, setPaneSettings] = useState(getCachedSetting('openAI'));

  const saveSettings = useCallback(async (value: typeof paneSettings) => {
    setCachedSetting('openAI', value);
    await flushCachedSettings();
    return getSettings();
  }, []);

  const [result, callSetSettings] = useCallablePromise(saveSettings);

  function handleSaveSettings(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    callSetSettings(paneSettings);
  }

  const isDirty = JSON.stringify(paneSettings) !== JSON.stringify(getCachedSetting('openAI'));

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
