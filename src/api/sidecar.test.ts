import { Command, SpawnOptions } from '@tauri-apps/api/shell';
import { describe, test } from 'vitest';

import {
  flushCachedSettings,
  getCachedSetting,
  initSettings,
  setCachedSetting,
  SettingsSchema,
} from '../settings/settings';
import { noop } from '../utils/noop';
import { callSidecar } from './sidecar';

vi.mock('../settings/settings');
vi.mock('@tauri-apps/api/shell');

const mockSettings: SettingsSchema = {
  project: {
    name: 'PROJECT-NAME',
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
    vi.mocked(flushCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      switch (key) {
        case 'openAI':
        case 'project':
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

  test('should flow 5 settings values to ENV vars', async () => {
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
    expect(Object.keys(env ?? {}).length).toBe(5);

    expect(env?.OPENAI_API_KEY).toBe(mockSettings.openAI.apiKey);
    expect(env?.OPENAI_CHAT_MODEL).toBe(mockSettings.openAI.chatModel);
    expect(env?.OPENAI_COMPLETE_MODEL).toBe(mockSettings.openAI.completeModel);
    // Logging
    expect(env?.SIDECAR_ENABLE_LOGGING).toBe(String(mockSettings.sidecar.logging.active));
    expect(env?.SIDECAR_LOG_DIR).toBe(mockSettings.sidecar.logging.path);
  });

  test('should throw exception if stderr has content', async () => {
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
