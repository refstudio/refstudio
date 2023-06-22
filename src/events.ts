import { emit, EventCallback, EventName, listen } from '@tauri-apps/api/event';

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

export function emitEvent(event: EventName) {
  void emit(event);
}

export type RefStudioEventCallback<Payload = void> = EventCallback<Payload>;

export async function listenEvent<EventPayload = void>(event: string, fn: RefStudioEventCallback<EventPayload>) {
  return listen<EventPayload>(event, fn);
}
