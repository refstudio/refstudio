import { emit, EventCallback, EventName, listen } from '@tauri-apps/api/event';

export const RefStudioEvents = {
  menu: {
    settings: 'refstudio://menu/settings',
    references: {
      upload: 'refstudio://menu/references/upload',
    },
  },
  references: {
    ingestion: {
      run: 'refstudio://references/ingestion/run',
    },
  },
};

export function emitEvent<Payload>(event: EventName, payload?: Payload) {
  void emit(event, payload);
}

export type RefStudioEventCallback<Payload = undefined> = EventCallback<Payload>;

export async function listenEvent<EventPayload = void>(event: string, fn: RefStudioEventCallback<EventPayload>) {
  return listen<EventPayload>(event, fn);
}
