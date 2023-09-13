import { FlatSettingsSchema, RewriteMannerType } from '../api/api-types';
import { apiGetJson, apiPut } from '../api/typed-api';

export function getMannerOptions(): RewriteMannerType[] {
  return ['concise', 'elaborate', 'scholarly'];
}

/**
 * This pulls out just the parts of SettingsManager that are used in the app.
 * This makes it easier to stub in an in-memory equivalent of SettingsManager.
 * This can all go away when we have a settings API.
 */
export interface SettingsManagerView<T> {
  default: T;
  getCache: <K extends keyof T>(key: K) => T[K];
  setCache: <K extends keyof T>(key: K, value: T[K]) => T[K];
  syncCache: () => Promise<T>;
}

let settingsManager: SettingsManagerView<FlatSettingsSchema> | undefined;

export async function initSettings() {
  let settings: FlatSettingsSchema;
  try {
    settings = await apiGetJson('/api/settings/');
    console.log('Settings initialized with success with', settings);
  } catch (err) {
    console.error('Cannot init settings', err);
    throw new Error('Cannot init settings');
  }

  settingsManager = {
    default: settings,
    getCache: (key) => settings[key],
    setCache: (key, value) => {
      settings[key] = value;
      return value;
    },
    syncCache: async () => {
      settings = await apiPut('/api/settings/', settings);
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

export function getCachedSetting<K extends keyof FlatSettingsSchema>(key: K): FlatSettingsSchema[K] {
  return getSettings().getCache(key);
}

export function setCachedSetting<K extends keyof FlatSettingsSchema>(key: K, value: FlatSettingsSchema[K]) {
  getSettings().setCache(key, value);
}

export async function saveCachedSettings() {
  await getSettings().syncCache();
}
