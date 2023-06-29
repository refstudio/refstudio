import { Command, SpawnOptions } from '@tauri-apps/api/shell';
import { describe, it } from 'vitest';

import { noop } from '../../lib/noop';
import {
  getCachedSetting,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
  SettingsSchema,
} from '../../settings/settingsManager';
import { callSidecar } from '../sidecar';

vi.mock('../settings/settingsManager');
vi.mock('@tauri-apps/api/shell');

const mockSettings: SettingsSchema = {
  general: {
    appDataDir: 'APP_DATA_DIR',
    projectName: 'PROJECT-NAME',
  },
  openAI: {
    apiKey: 'API KEY',
    chatModel: 'CHAT MODEL',
    completeModel: 'COMPLETE MODEL',
  },
  sidecar: {
    logging: {
      active: true,
      path: 'PATH',
    },
  },
};

describe('sidecar', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      switch (key) {
        case 'openAI':
        case 'general':
        case 'sidecar':
          return mockSettings[key];
        default:
          throw new Error('UNEXPECTED CALL FOR KEY ' + key);
      }
    });
    vi.mocked(setCachedSetting).mockImplementation(noop);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should send settings values via ENV', async () => {
    let env: undefined | Record<string, string>;
    vi.mocked(Command).mockImplementation((program: string, args?: string | string[], options?: SpawnOptions) => {
      env = options?.env;
      return {
        execute: () => ({
          stdout: JSON.stringify({}),
        }),
      } as unknown as Command;
    });

    await callSidecar('chat', []);

    expect(vi.mocked(getCachedSetting).mock.calls.length).toBeGreaterThan(0);
    expect(Object.keys(env ?? {}).length).toBe(7);

    // General
    expect(env?.APP_DATA_DIR).toBe(mockSettings.general.appDataDir);
    expect(env?.PROJECT_NAME).toBe(mockSettings.general.projectName);
    // OpenAI
    expect(env?.OPENAI_API_KEY).toBe(mockSettings.openAI.apiKey);
    expect(env?.OPENAI_CHAT_MODEL).toBe(mockSettings.openAI.chatModel);
    expect(env?.OPENAI_COMPLETE_MODEL).toBe(mockSettings.openAI.completeModel);
    // Logging
    expect(env?.SIDECAR_ENABLE_LOGGING).toBe(String(mockSettings.sidecar.logging.active));
    expect(env?.SIDECAR_LOG_DIR).toBe(mockSettings.sidecar.logging.path);
  });

  it('should throw exception if stderr has content', async () => {
    vi.mocked(Command).mockImplementation(
      () =>
        ({
          execute: () => ({
            stderr: 'error details',
          }),
        } as unknown as Command),
    );

    await expect(callSidecar('chat', [])).rejects.toThrow('error details');
  });
});
