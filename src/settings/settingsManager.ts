import { SettingsManager } from 'tauri-settings';
import { Path, PathValue } from 'tauri-settings/dist/types/dot-notation';
import { getDotNotation, setDotNotation } from 'tauri-settings/dist/utils/dot-notation';

import { getSystemConfigurationsDir } from '../io/filesystem';
import { readEnv } from '../io/readEnv';

export type OpenAiManner = 'concise' | 'elaborate' | 'scholarly';
export function getMannerOptions(): OpenAiManner[] {
  return ['concise', 'elaborate', 'scholarly'];
}

export interface SettingsSchema {
  /**
   * @deprecated this exists for retro-compatibility with v23.1.0 and should be removed.
   */
  general?: {
    appDataDir: string;
    projectName: string;
  };
  project: {
    currentDir: string;
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

export const DEFAULT_OPEN_AI_CHAT_MODEL = 'gpt-3.5-turbo';

export async function initSettings() {
  try {
    const settings: SettingsSchema = {
      project: {
        currentDir: import.meta.env.VITE_IS_WEB ? '' : 'MIGRATE_FROM_GENERAL',
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
    };

    let configs;
    if (import.meta.env.VITE_IS_WEB) {
      configs = settings;

      settingsManager = {
        default: settings,
        getCache: (key) => getDotNotation(settings, key)!,
        setCache: (key, value) => {
          setDotNotation(settings, key, value);
          return value;
        },
        syncCache: () => Promise.resolve(settings),
      };
    } else {
      const tauriSettingsManager = new SettingsManager<SettingsSchema>(settings, {
        dir: await getSystemConfigurationsDir(),
        fileName: 'refstudio-settings.json',
        prettify: true,
      });
      settingsManager = tauriSettingsManager;

      configs = await tauriSettingsManager.initialize();
      // Run retro-compatibility migration if required key is missing
      if (configs.project.currentDir === 'MIGRATE_FROM_GENERAL') {
        if (configs.general?.appDataDir && configs.general.projectName) {
          setCachedSetting('project.currentDir', configs.general.appDataDir + configs.general.projectName);
        } else {
          setCachedSetting('project.currentDir', '');
        }
        await saveCachedSettings();
      }
    }

    console.log('Settings initialized with success with', configs);
    console.log('openAI', configs.openAI);
  } catch (err) {
    console.error('Cannot init settings', err);
    throw new Error('Cannot init settings');
  }
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
