import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { JSONDebug, JSONDebugContainer } from '../components/JSONDebug';
import { getCachedSetting, getSettings, saveCachedSettings, setCachedSetting } from './settings';
import { SettingsPane, SettingsPaneProps } from './SettingsPane';

export function OpenAiSettingsPane({ config }: SettingsPaneProps) {
  const [paneSettings, setPaneSettings] = useState(getCachedSetting('openAI'));

  const saveMutation = useMutation({
    mutationFn: async (value: typeof paneSettings) => {
      setCachedSetting('openAI', value);
      await saveCachedSettings();
      return getSettings();
    },
  });

  function handleSaveSettings(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    saveMutation.mutate(paneSettings);
  }

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
            <input
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
            <label htmlFor="completeModel">Complete Model</label>
            <input
              className="w-full border bg-slate-50 px-2 py-0.5"
              id="completeModel"
              value={paneSettings.completeModel}
              onChange={(e) => setPaneSettings({ ...paneSettings, completeModel: e.currentTarget.value })}
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
        <JSONDebug header="paneSettings" value={paneSettings} />
        <JSONDebug header="API call result" value={saveMutation.data} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}
