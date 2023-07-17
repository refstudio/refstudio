import { SettingsManager } from 'tauri-settings';
import { Path, PathValue } from 'tauri-settings/dist/types/dot-notation';

import { getSystemAppDataDir, getSystemConfigurationsDir } from '../io/filesystem';
import { readEnv } from '../io/readEnv';

export type OpenAiManner = 'concise' | 'elaborate' | 'scholarly';
export function getMannerOptions(): OpenAiManner[] {
  return ['concise', 'elaborate', 'scholarly'];
}

export interface SettingsSchema {
  general: {
    appDataDir: string;
    projectName: string;
  };
  openAI: {
    apiKey: string;
    chatModel: string;
    manner: OpenAiManner;
    /** Control the "creativity" of OpenAI. Value should be between 0.7 and 0.9 */
    temperature: number;
  };
  sidecar: {
    logging: {
      active: boolean;
      path: string;
    };
  };
}

let settingsManager: SettingsManager<SettingsSchema> | undefined;

export const DEFAULT_OPEN_AI_CHAT_MODEL = 'gpt-3.5-turbo';

export async function initSettings() {
  settingsManager = new SettingsManager<SettingsSchema>(
    {
      general: {
        appDataDir: await getSystemAppDataDir(),
        projectName: 'project-x',
      },
      openAI: {
        apiKey: await readEnv('OPENAI_API_KEY', ''),
        chatModel: await readEnv('OPENAI_CHAT_MODEL', DEFAULT_OPEN_AI_CHAT_MODEL),
        manner: (await readEnv('OPENAI_MANNER', 'scholarly')) as OpenAiManner,
        temperature: parseFloat(await readEnv('OPENAI_TEMPERATURE', '0.7')),
      },
      sidecar: {
        logging: {
          active: (await readEnv('SIDECAR_ENABLE_LOGGING', 'false')).toLowerCase() === 'true',
          path: await readEnv('SIDECAR_LOG_DIR', '/tmp'),
        },
      },
    },
    {
      dir: await getSystemConfigurationsDir(),
      fileName: 'refstudio-settings.json',
      prettify: true,
    },
  );

  const configs = await settingsManager.initialize();
  console.log('Settings initialized with success with', configs);
  console.log('openAI', configs.openAI);
}

export function getSettings() {
  if (!settingsManager) {
    throw new Error('FATAL: Cannot read settings');
  }
  return settingsManager;
}

export function getCachedSetting<K extends Path<SettingsSchema>>(key: K): PathValue<SettingsSchema, K> {
  return getSettings().getCache(key);
}

export function setCachedSetting<K extends Path<SettingsSchema>>(key: K, value: PathValue<SettingsSchema, K>) {
  getSettings().setCache(key, value);
}

export async function saveCachedSettings() {
  await getSettings().syncCache();
}
