import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { getCachedSetting, getSettings, saveCachedSettings, setCachedSetting } from '../settingsManager';
import { SettingsPane, SettingsPaneProps } from './SettingsPane';

export function GeneralSettingsPane({ config }: SettingsPaneProps) {
  const [generalSettings] = useState(getCachedSetting('general'));
  const [sidecarLoggingSettings, setSidecarLoggingSettings] = useState(getCachedSetting('sidecar.logging'));

  const saveMutation = useMutation({
    mutationFn: async (data: { general: typeof generalSettings; sidecarLogging: typeof sidecarLoggingSettings }) => {
      setCachedSetting('general', data.general);
      setCachedSetting('sidecar.logging', data.sidecarLogging);
      await saveCachedSettings();
      return getSettings();
    },
  });

  const handleSaveSettings = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    saveMutation.mutate({ general: generalSettings, sidecarLogging: sidecarLoggingSettings });
  };

  const isDirty =
    JSON.stringify(generalSettings) !== JSON.stringify(getCachedSetting('general')) ||
    JSON.stringify(sidecarLoggingSettings) !== JSON.stringify(getCachedSetting('sidecar.logging'));

  return (
    <SettingsPane config={config} description="General settings for the refstudio application." header={config.title}>
      <form className="mt-10" onSubmit={handleSaveSettings}>
        <fieldset className="space-y-4">
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="app-dir">
              Project Dir
            </label>
            <input
              className="w-full border bg-slate-50 px-2 py-0.5 text-gray-500"
              id="app-dir"
              readOnly
              value={generalSettings.projectDir}
            />
            <p className="text-xs text-gray-500">NOTE: This setting is readonly (for now!)</p>
          </div>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="project-name">
              Project Name
            </label>
            <input
              className="w-full border bg-slate-50 px-2 py-0.5 text-gray-500"
              id="project-name"
              readOnly
              value={generalSettings.projectName}
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
          {saveMutation.isSuccess && <span className="px-2 text-primary">Saved!</span>}
          {saveMutation.isError && <span className="px-2 text-red-300">{String(saveMutation.error)}</span>}
          <input className="btn-primary" disabled={!isDirty || saveMutation.isLoading} type="submit" value="SAVE" />
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
