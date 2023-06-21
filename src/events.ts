import { emit, listen } from '@tauri-apps/api/event';

export const RefStudioEvents = {
  Menu: {
    settings: 'tauri://menu/settings',
  },
};

export function emitEvent(event: string) {
  (async function run() {
    await emit(event);
  })();
}

export async function listenEvent(event: string, fn: () => void) {
  return listen(event, fn);
}
