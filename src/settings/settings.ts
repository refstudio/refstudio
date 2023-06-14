import { invoke } from '@tauri-apps/api';
import { SettingsManager } from 'tauri-settings';

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

const settingsManager = new SettingsManager<Schema>(
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
    fileName: 'settings',
    prettify: true,
  },
);

export async function initSettings() {
  const configs = await settingsManager.initialize();
  console.log('Settings initialized with success with', configs);
  console.log('openAI', configs.openAI);
}

export function getSettings() {
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
