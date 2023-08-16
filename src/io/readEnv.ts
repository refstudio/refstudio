import { invoke } from '../wrappers/tauri-wrapper';

export async function readEnv(key: string, fallback: string) {
  try {
    const value = await invoke('get_environment_variable', { name: key });
    return String(value) || fallback;
  } catch (err) {
    console.error('Error reading env key %s. ', key, err);
    return fallback;
  }
}
