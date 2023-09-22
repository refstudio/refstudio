import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { FlatSettingsSchema } from '../../api/api-types';
import { Checkbox } from '../../components/Checkbox';
import { Input } from '../../components/Input';
import { getCachedSetting, getSettings, saveCachedSettings, setCachedSetting } from '../settingsManager';
import { SettingsPane, SettingsPaneProps } from './SettingsPane';

type LoggingSettings = Pick<FlatSettingsSchema, 'logging_enabled' | 'logging_filepath'>;

function getLoggingSettingsCached(): LoggingSettings {
  return {
    logging_enabled: getCachedSetting('logging_enabled'),
    logging_filepath: getCachedSetting('logging_filepath'),
  };
}

export const LOGGING_ACTIVE_TEST_ID = 'logging-active';
export const LOGGING_FILEPATH_TEST_ID = 'logging-filepath';

export function LoggingSettingsPane({ config }: SettingsPaneProps) {
  const [sidecarLoggingSettings, setSidecarLoggingSettings] = useState(getLoggingSettingsCached());

  const saveMutation = useMutation({
    mutationFn: async (data: { sidecarLogging: LoggingSettings }) => {
      setCachedSetting('logging_enabled', data.sidecarLogging.logging_enabled);
      setCachedSetting('logging_filepath', data.sidecarLogging.logging_filepath);
      await saveCachedSettings();
      return getSettings();
    },
  });

  const handleSaveSettings = () => {
    saveMutation.mutate({ sidecarLogging: sidecarLoggingSettings });
  };

  const isDirty = JSON.stringify(sidecarLoggingSettings) !== JSON.stringify(getLoggingSettingsCached());

  return (
    <SettingsPane config={config} header={config.title} isDirty={isDirty} onSave={handleSaveSettings}>
      <div className="flex flex-col items-start gap-2">
        <h2 className="t text-modal-txt-primary">Sidecar Logging</h2>
        <Checkbox
          checked={sidecarLoggingSettings.logging_enabled}
          data-testid={LOGGING_ACTIVE_TEST_ID}
          disabled
          onChange={(logging_enabled) => setSidecarLoggingSettings({ ...sidecarLoggingSettings, logging_enabled })}
        />
      </div>
      <div className="flex flex-col items-start gap-2">
        <h2 className="text-modal-txt-primary">Path</h2>
        <Input
          data-testid={LOGGING_FILEPATH_TEST_ID}
          disabled
          value={sidecarLoggingSettings.logging_filepath}
          onChange={(logging_filepath) => setSidecarLoggingSettings({ ...sidecarLoggingSettings, logging_filepath })}
        />
        <div className="text-modal-txt-secondary">
          The log filename is <code>{sidecarLoggingSettings.logging_filepath}/refstudio-sidecar.log</code>.
        </div>
      </div>
    </SettingsPane>
  );
}
