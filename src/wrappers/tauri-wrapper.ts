import { invoke as tauriInvoke } from '@tauri-apps/api';

export const invoke: typeof tauriInvoke = (cmd, args) => {
  console.log('invoke', cmd, args);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return null as any;
};
