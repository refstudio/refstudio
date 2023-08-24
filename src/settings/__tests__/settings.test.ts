import { SettingsManager } from 'tauri-settings';

import { readEnv } from '../../io/readEnv';
import {
  getCachedSetting,
  getSettings,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
  SettingsSchema,
} from '../settingsManager';

vi.mock('tauri-settings');
vi.mock('../../io/filesystem');
vi.mock('../../io/readEnv');

describe('settings', () => {
  beforeEach(() => {
    vi.mocked(readEnv).mockResolvedValue('some value');
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  // eslint-disable-next-line vitest/expect-expect
  it('should throw when using getSettings before initialization', () => {
    try {
      getSettings();
      fail();
    } catch {
      // OK
    }
  });

  it('should getSettings manager after call to initSettings', async () => {
    const fn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings, options) =>
        ({
          initialize: fn.mockReturnValue(defaultSettings),
          options,
          getCache: vi.fn(),
          setCache: vi.fn(),
          syncCache: vi.fn(),
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    expect(getSettings()).toBeDefined();
    expect(fn).toBeCalledTimes(1);
  });

  it('should read settings from env', async () => {
    vi.mocked(readEnv).mockResolvedValue('some value');
    const fn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings, options) =>
        ({
          initialize: fn.mockReturnValue(defaultSettings),
          options,
          getCache: vi.fn(),
          setCache: vi.fn(),
          syncCache: vi.fn(),
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    expect(getSettings()).toBeDefined();
    expect(vi.mocked(readEnv).mock.calls.length).toBeGreaterThan(0);
    expect(getSettings()).toBeDefined();
  });

  it('should read default value from env', async () => {
    vi.mocked(readEnv).mockResolvedValue('OPENAI_CHAT_MODEL-value');
    const fn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings, options) =>
        ({
          default: defaultSettings,
          initialize: fn.mockReturnValue(defaultSettings),
          options,
          getCache: vi.fn(),
          setCache: vi.fn(),
          syncCache: vi.fn(),
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    expect(getSettings().default.openai.chat_model).toBe('OPENAI_CHAT_MODEL-value');
  });

  it('should call settingsManager via getCachedSetting and setCachedSetting', async () => {
    const getCachedFn = vi.fn();
    const setCachedFn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings, options) =>
        ({
          default: defaultSettings,
          options,
          initialize: () => defaultSettings,
          getCache: getCachedFn,
          setCache: setCachedFn,
          syncCache: vi.fn(),
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    getCachedSetting('openai.api_key');
    expect(getCachedFn).toBeCalled();
    expect(getCachedFn).toBeCalledWith('openAI.apiKey');

    setCachedSetting('openai.chat_model', 'value');
    expect(setCachedFn).toBeCalled();
    expect(setCachedFn).toBeCalledWith('openAI.chatModel', 'value');
  });

  it('should call settingsManager.syncCache via saveCachedSettings', async () => {
    const syncCacheFn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings, options) =>
        ({
          default: defaultSettings,
          options,
          initialize: () => defaultSettings,
          getCache: vi.fn(),
          setCache: vi.fn(),
          syncCache: syncCacheFn,
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    await saveCachedSettings();
    expect(syncCacheFn).toBeCalled();
  });
});
