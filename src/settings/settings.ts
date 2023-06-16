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
  sidecar: {
    logging: {
      active: boolean;
      path: string;
    };
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
