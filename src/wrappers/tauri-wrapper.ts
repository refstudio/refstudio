import { invoke as tauriInvoke } from '@tauri-apps/api';

export const invoke: typeof tauriInvoke = (cmd, args) => {
  console.log('invoke', cmd, args);
  if (cmd === 'get_environment_variable') {
    return '';
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  return null as any;
};
