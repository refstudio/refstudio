import { SettingsManager } from 'tauri-settings';

import { readEnv } from '../utils/readEnv';
import {
  getCachedSetting,
  getSettings,
  initSettings,
  saveCachedSettings,
  setCachedSetting,
  SettingsSchema,
} from './settings';

vi.mock('tauri-settings');
vi.mock('../filesystem');
vi.mock('../utils/readEnv');

describe('settings', () => {
  beforeEach(() => {
    vi.mocked(readEnv).mockResolvedValue('some value');
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should throw when using getSettings before initialization', () => {
    try {
      getSettings();
      fail();
    } catch {
      // OK
    }
  });

  test('should getSettings manager after call to initSettings', async () => {
    const fn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings) =>
        ({
          initialize: fn.mockReturnValue(defaultSettings),
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    expect(getSettings()).toBeDefined();
    expect(fn).toBeCalled();
  });

  test('should read settings from env', async () => {
    vi.mocked(readEnv).mockResolvedValue('some value');
    const fn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings) =>
        ({
          initialize: fn.mockReturnValue(defaultSettings),
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    expect(getSettings()).toBeDefined();
    expect(vi.mocked(readEnv).mock.calls.length).toBeGreaterThan(0);
    expect(getSettings()).toBeDefined();
  });

  test('should read default value from env', async () => {
    vi.mocked(readEnv).mockResolvedValue('OPENAI_COMPLETE_MODEL-value');
    const fn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings) =>
        ({
          default: defaultSettings,
          initialize: fn.mockReturnValue(defaultSettings),
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    expect(getSettings().default.openAI.chatModel).toBe('OPENAI_COMPLETE_MODEL-value');
  });

  test('should call settingsManager via getCachedSetting and setCachedSetting', async () => {
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
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    getCachedSetting('openAI.apiKey');
    expect(getCachedFn).toBeCalled();
    expect(getCachedFn).toBeCalledWith('openAI.apiKey');

    setCachedSetting('openAI.chatModel', 'value');
    expect(setCachedFn).toBeCalled();
    expect(setCachedFn).toBeCalledWith('openAI.chatModel', 'value');
  });

  test('should call settingsManager.syncCache via saveCachedSettings', async () => {
    const syncCacheFn = vi.fn();
    vi.mocked(SettingsManager<SettingsSchema>).mockImplementation(
      (defaultSettings, options) =>
        ({
          default: defaultSettings,
          options,
          initialize: () => defaultSettings,
          syncCache: syncCacheFn,
        } as unknown as SettingsManager<SettingsSchema>),
    );
    await initSettings();
    await saveCachedSettings();
    expect(syncCacheFn).toBeCalled();
  });
});
