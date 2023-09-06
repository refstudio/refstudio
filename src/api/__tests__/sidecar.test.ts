import { Command, SpawnOptions } from '@tauri-apps/api/shell';

import { noop } from '../../lib/noop';
import { getCachedSetting, initSettings, saveCachedSettings, setCachedSetting } from '../../settings/settingsManager';
import { FlatSettingsSchema } from '../api-types';
import { callSidecar } from '../sidecar';

vi.mock('../../settings/settingsManager');
vi.mock('@tauri-apps/api/shell');

const mockSettings: FlatSettingsSchema = {
  active_project_id: '123',
  openai_api_key: '',
  openai_chat_model: 'gpt-3.5-turbo',
  openai_manner: 'concise',
  openai_temperature: 0.7,
  logging_enabled: true,
  logging_filepath: '/tmp',
};

describe('sidecar', () => {
  beforeEach(() => {
    // Fake settings methods
    vi.mocked(initSettings).mockResolvedValue();
    vi.mocked(saveCachedSettings).mockResolvedValue();
    vi.mocked(getCachedSetting).mockImplementation((key) => {
      if (key in mockSettings) {
        return mockSettings[key];
      }
      throw new Error('UNEXPECTED CALL FOR KEY ' + key);
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
    expect(Object.keys(env ?? {}).length).toBe(4);

    // OpenAI
    expect(env?.OPENAI_API_KEY).toBe(mockSettings.openai_api_key);
    expect(env?.OPENAI_CHAT_MODEL).toBe(mockSettings.openai_chat_model);
    // Logging
    expect(env?.SIDECAR_ENABLE_LOGGING).toBe(String(mockSettings.logging_enabled));
    expect(env?.SIDECAR_LOG_DIR).toBe(mockSettings.logging_filepath);
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
