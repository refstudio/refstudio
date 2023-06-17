import { useCallback, useState } from 'react';

import { useCallablePromise } from '../hooks/useCallablePromise';
import { flushCachedSettings, getCachedSetting, getSettings, setCachedSetting } from './settings';
import { SettingsPane, SettingsPaneProps } from './SettingsPane';

export function GeneralSettingsPane({ config }: SettingsPaneProps) {
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
    <SettingsPane config={config} description="General settings for the refstudio application." header={config.title}>
      <form className="mt-10" onSubmit={handleSaveSettings}>
        <fieldset className="space-y-4">
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="project-name">
              Project Name
            </label>
            <input
              className="w-full border bg-slate-50 px-2 py-0.5"
              id="project-name"
              readOnly
              value={projectSettings.name}
              onChange={(e) => setProjectSettings({ ...projectSettings, name: e.currentTarget.value })}
            />
            <p className="text-xs text-gray-500">NOTE: This setting is readonly (for now!)</p>
          </div>
          <h3>Sidecar Logging</h3>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="active">
              Active
            </label>
            <input
              checked={sidecarLoggingSettings.active}
              className="w-full border px-2 py-0.5"
              id="active"
              type="checkbox"
              onChange={(e) =>
                setSidecarLoggingSettings({ ...sidecarLoggingSettings, active: e.currentTarget.checked })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="path">
              Path
            </label>
            <input
              className="w-full border bg-slate-50 px-2 py-0.5"
              id="path"
              value={sidecarLoggingSettings.path}
              onChange={(e) => setSidecarLoggingSettings({ ...sidecarLoggingSettings, path: e.currentTarget.value })}
            />
            <p className="text-xs text-gray-500">
              The log filename is <em>refstudio-sidecar.log</em>.
            </p>
          </div>
        </fieldset>
        <fieldset className="mt-10 flex justify-end">
          <input className="btn-primary" disabled={!isDirty || result.state === 'loading'} type="submit" value="SAVE" />
        </fieldset>
      </form>

      {/* <JSONDebugContainer className="mt-28">
        <JSONDebug header="paneSettings" value={projectSettings} />
        <JSONDebug header="sidecarLogging" value={sidecarLoggingSettings} />
        <JSONDebug header="API call result" value={result} />
      </JSONDebugContainer> */}
    </SettingsPane>
  );
}
