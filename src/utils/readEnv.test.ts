import { invoke } from '@tauri-apps/api';

import { readEnv } from './readEnv';

vi.mock('@tauri-apps/api');

describe('readEnv', () => {
  test('should return env value from tauri', async () => {
    vi.mocked(invoke).mockResolvedValue('TAURI ENV VALUE');
    const value = await readEnv('KEY');
    expect(value).toBe('TAURI ENV VALUE');
  });

  test('should fallback if env value is empty', async () => {
    vi.mocked(invoke).mockResolvedValue('');
    const value = await readEnv('KEY', 'FALLBACK');
    expect(value).toBe('FALLBACK');
  });

  test('should fallback if throw', async () => {
    vi.mocked(invoke).mockRejectedValue('some error');
    const value = await readEnv('KEY', 'FALLBACK');
    expect(value).toBe('FALLBACK');
  });
});
