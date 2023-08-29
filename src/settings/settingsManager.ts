import { SettingsManager } from 'tauri-settings';
import { Path, PathValue } from 'tauri-settings/dist/types/dot-notation';
import { getDotNotation, setDotNotation } from 'tauri-settings/dist/utils/dot-notation';

import { universalGet, universalPut } from '../api/api';
import type * as apiTypes from '../api/api-types';

export type OpenAiManner = apiTypes.RewriteMannerType;
export function getMannerOptions(): OpenAiManner[] {
  return ['concise', 'elaborate', 'scholarly'];
}

type DeepRequired<T> = T extends object ? { [k in keyof T]-?: DeepRequired<T[k]> } : T;

export type SettingsSchema = DeepRequired<apiTypes.SettingsSchema>;

/**
 * This pulls out just the parts of SettingsManager that are used in the app.
 * This makes it easier to stub in an in-memory equivalent of SettingsManager.
 * This can all go away when we have a settings API.
 */
export type SettingsManagerView = Pick<
  SettingsManager<SettingsSchema>,
  'getCache' | 'setCache' | 'syncCache' | 'default'
>;

let settingsManager: SettingsManagerView | undefined;

export async function initSettings() {
  let settings: SettingsSchema;
  try {
    settings = await universalGet<SettingsSchema>('/api/settings/');

    console.log('Settings initialized with success with', settings);
    console.log('openAI', settings.openai);
  } catch (err) {
    console.error('Cannot init settings', err);
    throw new Error('Cannot init settings');
  }

  settingsManager = {
    default: settings,
    getCache: (key) => getDotNotation(settings, key)!,
    setCache: (key, value) => {
      setDotNotation(settings, key, value);
      return value;
    },
    syncCache: async () => {
      const newSettings = await universalPut<SettingsSchema>('/api/settings/', settings);
      settings = newSettings;
      return settings;
    },
  };
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
