import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { JSONDebug, JSONDebugContainer } from '../../../components/JSONDebug';
import { PasswordInput } from '../../../components/PasswordInput';
import { SettingsPane, SettingsPaneProps } from '../../../settings/panes/SettingsPane';
import {
  getCachedSetting,
  getSettings,
  MANNER_OPTIONS,
  OpenAiManner,
  saveCachedSettings,
  setCachedSetting,
} from '../../../settings/settingsManager';

export function OpenAiSettingsPane({ config }: SettingsPaneProps) {
  const [paneSettings, setPaneSettings] = useState(getCachedSetting('openAI'));

  const saveMutation = useMutation({
    mutationFn: async (value: typeof paneSettings) => {
      setCachedSetting('openAI', value);
      await saveCachedSettings();
      return getSettings();
    },
  });

  const handleSaveSettings = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    saveMutation.mutate(paneSettings);
  };

  const isDirty = JSON.stringify(paneSettings) !== JSON.stringify(getCachedSetting('openAI'));

  return (
    <SettingsPane
      config={config}
      description="You need to configure the API to use the rewrite and chat operations."
      header={config.title}
    >
      <form className="mt-10" onSubmit={handleSaveSettings}>
        <fieldset className="space-y-4">
          <div>
            <label htmlFor="apiKey">API Key</label>
            <PasswordInput
              className="w-full border bg-slate-50 px-2 py-0.5"
              data-testid="apiKey"
              id="apiKey"
              value={paneSettings.apiKey}
              onChange={(e) => setPaneSettings({ ...paneSettings, apiKey: e.currentTarget.value })}
            />
          </div>
          <div>
            <label htmlFor="chatModel">Chat Model</label>
            <input
              className="w-full border bg-slate-50 px-2 py-0.5"
              id="chatModel"
              value={paneSettings.chatModel}
              onChange={(e) => setPaneSettings({ ...paneSettings, chatModel: e.currentTarget.value })}
            />
          </div>
          <div>
            <label htmlFor="manner">Manner</label>
            <select
              className="w-full border bg-slate-50 px-2 py-0.5"
              id="manner"
              value={paneSettings.manner}
              onChange={(e) => setPaneSettings({ ...paneSettings, manner: e.currentTarget.value as OpenAiManner })}
            >
              {MANNER_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="temperature">Creativity (temperature)</label>
            <input
              className="w-full border bg-slate-50 px-2 py-0.5"
              id="temperature"
              max={0.9}
              min={0.7}
              step={0.01}
              type="range"
              value={paneSettings.temperature}
              onChange={(e) => setPaneSettings({ ...paneSettings, temperature: parseFloat(e.currentTarget.value) })}
            />
          </div>
        </fieldset>
        <fieldset className="mt-10 flex items-center justify-end">
          {saveMutation.isSuccess && <span className="px-2 text-primary">Saved!</span>}
          {saveMutation.isError && <span className="px-2 text-red-300">{String(saveMutation.error)}</span>}
          <input className="btn-primary" disabled={!isDirty || saveMutation.isLoading} type="submit" value="SAVE" />
        </fieldset>
      </form>

      <JSONDebugContainer className="mt-28">
        <JSONDebug header="paneSettings" maskedKeys={['apiKey']} value={paneSettings} />
        <JSONDebug header="API call result" maskedKeys={['apiKey']} value={saveMutation.data} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}
