import { Command, SpawnOptions } from '@tauri-apps/api/shell';

import { noop } from '../../lib/noop';
import {
  getCachedSetting,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
  SettingsSchema,
} from '../../settings/settingsManager';
import { callSidecar } from '../sidecar';

vi.mock('../../settings/settingsManager');
vi.mock('@tauri-apps/api/shell');

const mockSettings: SettingsSchema = {
  project: {
    current_directory: 'PROJECT-DIR',
  },
  openai: {
    api_key: 'API KEY',
    chat_model: 'CHAT MODEL',
    manner: 'concise',
    temperature: 0.7,
  },
  sidecar: {
    logging: {
      enable: true,
      filepath: 'PATH',
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
        case 'openai':
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

  it('should send settings values via ENV', async () => {
    let env: undefined | Record<string, string>;
    vi.mocked(Command).mockImplementation((program: string, args?: string | string[], options?: SpawnOptions) => {
      env = options?.env;
      expect(args).toEqual(['chat', `{"text":"Hello chatbot!"}`]);
      return {
        execute: () => ({
          stdout: JSON.stringify({}),
        }),
      } as unknown as Command;
    });

    await callSidecar('chat', { text: 'Hello chatbot!' });

    expect(vi.mocked(getCachedSetting).mock.calls.length).toBeGreaterThan(0);
    expect(Object.keys(env ?? {}).length).toBe(5);

    // General
    expect(env?.PROJECT_DIR).toBe(mockSettings.project.current_directory);
    // OpenAI
    expect(env?.OPENAI_API_KEY).toBe(mockSettings.openai.api_key);
    expect(env?.OPENAI_CHAT_MODEL).toBe(mockSettings.openai.chat_model);
    // Logging
    expect(env?.SIDECAR_ENABLE_LOGGING).toBe(String(mockSettings.sidecar.logging.enable));
    expect(env?.SIDECAR_LOG_DIR).toBe(mockSettings.sidecar.logging.filepath);
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

    await expect(callSidecar('chat', { text: 'Hello chatbot!' })).rejects.toThrow();
  });
});
