import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { FlatSettingsSchema, RewriteMannerType } from '../../../api/api-types';
import { REWRITE_MANNER } from '../../../api/rewrite.config';
import { Dropdown } from '../../../components/Dropdown';
import { Input } from '../../../components/Input';
import { JSONDebug, JSONDebugContainer } from '../../../components/JSONDebug';
import { Slider } from '../../../components/Slider';
import { SettingsPane, SettingsPaneProps } from '../../../settings/panes/SettingsPane';
import { getCachedSetting, getSettings, saveCachedSettings, setCachedSetting } from '../../../settings/settingsManager';
import { CreativityInfoTooltip } from '../../components/CreativityInfoTooltip';
import { InfoIcon } from '../../components/icons';

interface OpenAISettings {
  api_key: FlatSettingsSchema['openai_api_key'];
  chat_model: FlatSettingsSchema['openai_chat_model'];
  manner: FlatSettingsSchema['openai_manner'];
  temperature: FlatSettingsSchema['openai_temperature'];
}

function getOpenAISettingsCached(): OpenAISettings {
  return {
    api_key: getCachedSetting('openai_api_key'),
    chat_model: getCachedSetting('openai_chat_model'),
    manner: getCachedSetting('openai_manner'),
    temperature: getCachedSetting('openai_temperature'),
  };
}

export const API_KEY_TEST_ID = 'api-key';
export const CHAT_MODEL_TEST_ID = 'chat-model';
export const REWRITE_MANNER_TEST_ID = 'rewrite-manner';
export const REWRITE_TEMPERATURE_TEST_ID = 'rewrite-temperature';

export function OpenAiSettingsPane({ config }: SettingsPaneProps) {
  const [paneSettings, setPaneSettings] = useState(getOpenAISettingsCached());

  const saveMutation = useMutation({
    mutationFn: async (value: typeof paneSettings) => {
      setCachedSetting('openai_api_key', value.api_key);
      setCachedSetting('openai_chat_model', value.chat_model);
      setCachedSetting('openai_manner', value.manner);
      setCachedSetting('openai_temperature', value.temperature);
      await saveCachedSettings();
      return getSettings();
    },
  });

  const handleSaveSettings = () => {
    saveMutation.mutate(paneSettings);
  };

  const isDirty = JSON.stringify(paneSettings) !== JSON.stringify(getOpenAISettingsCached());

  const tooltipContainerRef = useRef<HTMLDivElement>(null);

  return (
    <SettingsPane config={config} header={config.title} isDirty={isDirty} onSave={handleSaveSettings}>
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
        <div className="flex flex-row gap-1">
          <h2 className="t text-modal-txt-primary">Chat Model</h2>
          <ChatModelTooltip />
        </div>
        <Input
          data-testid={CHAT_MODEL_TEST_ID}
          value={paneSettings.chat_model}
          onChange={(chat_model) => setPaneSettings({ ...paneSettings, chat_model })}
        />
      </div>
      <div className="flex flex-col items-start gap-2">
        <h2 className="t text-modal-txt-primary">Speech Type</h2>
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
      <div className="flex flex-col items-start gap-2" ref={tooltipContainerRef}>
        <div className="flex items-start gap-1 self-stretch">
          <h2>Creativity Level</h2>
          <CreativityInfoTooltip id="settings-creativity-tooltip" maxWidth={tooltipContainerRef.current?.clientWidth} />
        </div>
        <Slider
          className="w-full"
          data-testid={REWRITE_TEMPERATURE_TEST_ID}
          max={0.9}
          min={0.7}
          name="creativity"
          step={0.01}
          value={paneSettings.temperature}
          onChange={(temperature) => setPaneSettings({ ...paneSettings, temperature })}
        />
      </div>

      <JSONDebugContainer className="mt-28">
        <JSONDebug header="paneSettings" maskedKeys={['apiKey']} value={paneSettings} />
        <JSONDebug header="API call result" maskedKeys={['apiKey']} value={saveMutation.data} />
      </JSONDebugContainer>
    </SettingsPane>
  );
}

function ChatModelTooltip() {
  return (
    <div className="text-btn-ico-tool-active">
      <div id="chat-tooltip">
        <InfoIcon />
      </div>
      {/* TODO: <Tooltip anchorSelect="#chat-tooltip" /> */}
    </div>
  );
}
