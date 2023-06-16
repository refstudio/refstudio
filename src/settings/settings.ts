import { invoke } from '@tauri-apps/api';
import { SettingsManager } from 'tauri-settings';

import { getConfigDir } from '../filesystem';

interface Schema {
  project: {
    name: string;
  };
  openAI: {
    apiKey: string;
    completeModel: string;
    chatModel: string;
  };
}

let settingsManager: SettingsManager<Schema> | undefined;

export async function initSettings() {
  settingsManager = new SettingsManager<Schema>(
    {
      project: {
        name: 'project-x',
      },
      openAI: {
        apiKey: await readEnv('OPENAI_API_KEY'),
        completeModel: await readEnv('OPENAI_COMPLETE_MODEL'),
        chatModel: await readEnv('OPENAI_CHAT_MODEL'),
      },
    },
    {
      dir: await getConfigDir(),
      fileName: 'main-settings.json',
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

async function readEnv(key: string) {
  try {
    const value = await invoke('get_environment_variable', { name: key });
    return String(value);
  } catch (err) {
    console.error('Error reading env key %s. ', key, err);
    return '';
  }
}
