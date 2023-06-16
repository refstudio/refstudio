import { SettingsManager } from 'tauri-settings';
import { Path, PathValue } from 'tauri-settings/dist/types/dot-notation';

import { getConfigDir } from '../filesystem';

export interface SettingsSchema {
  project: {
    name: string;
  };
  openAI: {
    apiKey: string;
    completeModel: string;
    chatModel: string;
  };
  sidecar: {
    logging: {
      active: boolean;
      path: string;
    };
  };
}

let settingsManager: SettingsManager<SettingsSchema> | undefined;

export async function initSettings() {
  settingsManager = new SettingsManager<SettingsSchema>(
    {
      project: {
        name: 'project-x',
      },
      openAI: {
        apiKey: '',
        completeModel: 'davinci',
        chatModel: 'gpt-3.5-turbo',
      },
      sidecar: {
        logging: {
          active: true,
          path: '/tmp',
        },
      },
    },
    {
      dir: await getConfigDir(),
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

export async function flushCachedSettings() {
  await getSettings().syncCache();
}
