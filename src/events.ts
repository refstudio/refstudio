import { emit, EventCallback, listen } from '@tauri-apps/api/event';

export const RefStudioEvents = {
  menu: {
    settings: 'refstudio://menu/settings',
  },
  references: {
    ingestion: {
      run: 'refstudio://references/ingestion/run',
    },
  },
};

export function emitEvent(event: string) {
  void emit(event);
}

export async function listenEvent<EventPayload>(event: string, fn: EventCallback<EventPayload>) {
  return listen<EventPayload>(event, fn);
}
