import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { FlatSettingsSchema } from '../../api/api-types';
import { getCachedSetting, getSettings, saveCachedSettings, setCachedSetting } from '../settingsManager';
import { SettingsPane, SettingsPaneProps } from './SettingsPane';

type LoggingSettings = Pick<FlatSettingsSchema, 'logging_enabled' | 'logging_filepath'>;

function getLoggingSettingsCached(): LoggingSettings {
  return {
    logging_enabled: getCachedSetting('logging_enabled'),
    logging_filepath: getCachedSetting('logging_filepath'),
  };
}

export function GeneralSettingsPane({ config }: SettingsPaneProps) {
  const [sidecarLoggingSettings, setSidecarLoggingSettings] = useState(getLoggingSettingsCached());

  const saveMutation = useMutation({
    mutationFn: async (data: { sidecarLogging: LoggingSettings }) => {
      setCachedSetting('logging_enabled', data.sidecarLogging.logging_enabled);
      setCachedSetting('logging_filepath', data.sidecarLogging.logging_filepath);
      await saveCachedSettings();
      return getSettings();
    },
  });

  const handleSaveSettings = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    saveMutation.mutate({ sidecarLogging: sidecarLoggingSettings });
  };

  const isDirty = JSON.stringify(sidecarLoggingSettings) !== JSON.stringify(getLoggingSettingsCached());

  return (
    <SettingsPane config={config} header={config.title}>
      <form className="mt-10" onSubmit={handleSaveSettings}>
        <fieldset className="space-y-4">
          <h3>Sidecar Logging</h3>
          <div className="space-y-2">
            <label className="font-semibold" htmlFor="active">
              Active
            </label>
            <input
              checked={sidecarLoggingSettings.logging_enabled}
              className="w-full border px-2 py-0.5"
              id="active"
              type="checkbox"
              onChange={(e) =>
                setSidecarLoggingSettings({ ...sidecarLoggingSettings, logging_enabled: e.currentTarget.checked })
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
              value={sidecarLoggingSettings.logging_filepath}
              onChange={(e) =>
                setSidecarLoggingSettings({ ...sidecarLoggingSettings, logging_filepath: e.currentTarget.value })
              }
            />
            <p className="text-xs text-gray-500">
              The log filename can be located in{' '}
              <code>{sidecarLoggingSettings.logging_filepath}/refstudio-sidecar.log</code>.
            </p>
          </div>
        </fieldset>
        <fieldset className="mt-10 flex justify-end">
          {saveMutation.isSuccess && <span className="px-2 text-primary">Saved!</span>}
          {saveMutation.isError && <span className="px-2 text-red-300">{String(saveMutation.error)}</span>}
          <input className="btn-primary" disabled={!isDirty || saveMutation.isLoading} type="submit" value="SAVE" />
        </fieldset>
      </form>
    </SettingsPane>
  );
}
