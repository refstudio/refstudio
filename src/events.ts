import { emit, EventCallback, EventName, listen } from '@tauri-apps/api/event';

export const RefStudioEvents = {
  menu: {
    file: {
      close: 'refstudio://menu/file/close',
      save: 'refstudio://menu/file/save',
    },
    settings: 'refstudio://menu/settings',
    references: {
      open: 'refstudio://menu/references/open',
      upload: 'refstudio://menu/references/upload',
    },
  },
  editors: {
    close: 'refstudio://editors/close',
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

export type RefStudioEventCallback<Payload> = EventCallback<Payload>;

export async function listenEvent<EventPayload = void>(event: string, fn: RefStudioEventCallback<EventPayload>) {
  return listen<EventPayload>(event, fn);
}
