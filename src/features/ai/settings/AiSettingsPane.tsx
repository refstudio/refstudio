import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { FlatSettingsSchema, ModelProvider, RewriteMannerType } from '../../../api/api-types';
import { REWRITE_MANNER } from '../../../api/rewrite.config';
import { Dropdown } from '../../../components/Dropdown';
import { Input } from '../../../components/Input';
import { JSONDebug, JSONDebugContainer } from '../../../components/JSONDebug';
import { Slider } from '../../../components/Slider';
import { InfoText, InfoTextOptions } from '../../../settings/panes/InfoText';
import { SettingsPane, SettingsPaneProps } from '../../../settings/panes/SettingsPane';
import { getCachedSetting, getSettings, saveCachedSettings, setCachedSetting } from '../../../settings/settingsManager';
import { CreativityInfoTooltipText } from '../../components/CreativityInfoTooltip';

interface AiSettings {
  provider: FlatSettingsSchema['model_provider'];
  model: FlatSettingsSchema['model'];
  api_key: FlatSettingsSchema['api_key'];
  manner: FlatSettingsSchema['rewrite_manner'];
  temperature: FlatSettingsSchema['temperature'];
}

function getAiSettingsCached(): AiSettings {
  return {
    provider: getCachedSetting('model_provider'),
    model: getCachedSetting('model'),
    api_key: getCachedSetting('api_key'),
    manner: getCachedSetting('rewrite_manner'),
    temperature: getCachedSetting('temperature'),
  };
}

export const MODEL_PROVIDER_TEST_ID = 'provider';
export const MODEL_TEST_ID = 'chat-model';
export const API_KEY_TEST_ID = 'api-key';
export const REWRITE_MANNER_TEST_ID = 'rewrite-manner';
export const REWRITE_TEMPERATURE_TEST_ID = 'rewrite-temperature';

const MODEL_PROVIDER_OPTIONS: { provider: ModelProvider; label: string }[] = [
  {
    provider: 'openai',
    label: 'Open AI',
  },
  {
    provider: 'ollama',
    label: 'Ollama',
  },
];

export function AiSettingsPane({ config }: SettingsPaneProps) {
  const [paneSettings, setPaneSettings] = useState(getAiSettingsCached());

  const saveMutation = useMutation({
    mutationFn: async (value: typeof paneSettings) => {
      setCachedSetting('model_provider', value.provider);
      setCachedSetting('model', value.model);
      setCachedSetting('api_key', value.api_key);
      setCachedSetting('rewrite_manner', value.manner);
      setCachedSetting('temperature', value.temperature);
      await saveCachedSettings();
      return getSettings();
    },
  });

  const handleSaveSettings = () => {
    saveMutation.mutate(paneSettings);
  };

  const isDirty = JSON.stringify(paneSettings) !== JSON.stringify(getAiSettingsCached());

  return (
    <SettingsPane config={config} header={config.title} isDirty={isDirty} onSave={handleSaveSettings}>
      <div className="flex flex-col items-start gap-2">
        <h2 className="t text-modal-txt-primary">Provider</h2>
        <Dropdown
          aria-label="provider"
          data-testid={MODEL_PROVIDER_TEST_ID}
          options={MODEL_PROVIDER_OPTIONS.map((option) => ({
            name: option.label,
            value: option.provider,
          }))}
          value={paneSettings.provider}
          onChange={(provider: ModelProvider) => setPaneSettings({ ...paneSettings, provider })}
        />
      </div>

      <div className="flex flex-col items-start gap-2">
        <h2 className="text-modal-txt-primary">Provider Model</h2>
        <Input
          data-testid={MODEL_TEST_ID}
          value={paneSettings.model}
          onChange={(chat_model) => setPaneSettings({ ...paneSettings, model: chat_model })}
        />
        <InfoText>
          <strong>Use: </strong>
          <InfoTextOptions
            options={[
              { value: 'gpt-3.5-turbo', label: 'OpenAI' },
              { value: 'llama2', label: 'for Ollama' },
            ]}
            onClick={(value) => setPaneSettings({ ...paneSettings, model: value })}
          />
        </InfoText>
      </div>
      <div className="flex flex-col items-start gap-2">
        <h2 className="t text-modal-txt-primary">API Key</h2>
        <Input
          data-testid={API_KEY_TEST_ID}
          type="password"
          value={paneSettings.api_key}
          onChange={(api_key) => setPaneSettings({ ...paneSettings, api_key })}
        />
      </div>
      <div className="flex flex-col items-start gap-2">
        <h2 className="text-modal-txt-primary">Speech Type</h2>
        <Dropdown
          aria-label="manner"
          data-testid={REWRITE_MANNER_TEST_ID}
          options={REWRITE_MANNER.map((manner) => ({
            name: manner.charAt(0).toUpperCase() + manner.slice(1),
            value: manner,
          }))}
          value={paneSettings.manner}
          onChange={(manner: RewriteMannerType) => setPaneSettings({ ...paneSettings, manner })}
        />
      </div>
      <div className="flex flex-col items-start gap-2">
        <h2>Creativity Level</h2>
        <Slider
          data-testid={REWRITE_TEMPERATURE_TEST_ID}
          fluid
          max={0.9}
          min={0.7}
          name="creativity"
          step={0.01}
          value={paneSettings.temperature}
          onChange={(temperature) => setPaneSettings({ ...paneSettings, temperature })}
        />
        <InfoText>{CreativityInfoTooltipText}</InfoText>
      </div>

      <JSONDebugContainer className="mt-28">
        <JSONDebug header="paneSettings" maskedKeys={['apiKey']} value={paneSettings} />
        <JSONDebug header="API call result" maskedKeys={['apiKey']} value={saveMutation.data} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}
