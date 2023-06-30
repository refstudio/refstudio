import { emit, EventCallback, listen } from '@tauri-apps/api/event';

import { PaneEditorId } from './atoms/types/PaneGroup';

interface RefStudioEventPayloads {
  'refstudio://menu/file/close': undefined;
  'refstudio://menu/file/save': undefined;
  'refstudio://menu/settings': undefined;
  'refstudio://menu/references/open': undefined;
  'refstudio://menu/references/upload': undefined;
  'refstudio://editors/close': PaneEditorId;
  'refstudio://references/ingestion/run': undefined;
}

export type RefStudioEventName = keyof RefStudioEventPayloads;

export type RefStudioEventPayload<Event extends RefStudioEventName> = RefStudioEventPayloads[Event];

type RefStudioEventsWithNonEmptyPayload<Event = RefStudioEventName> = Event extends RefStudioEventName
  ? RefStudioEventPayload<Event> extends undefined
    ? never
    : Event
  : never;

type RefStudioEventsWithEmptyPayload = Exclude<RefStudioEventName, RefStudioEventsWithNonEmptyPayload>;

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
      run: 'refstudio://references/ingestion/ru',
    },
  },
} as const;

interface RecursiveRecord<T> {
  [K: string]: T | RecursiveRecord<T>;
}
// If there is a typo in the `RefStudioEvents` object, typescript will detect it with this failing cast
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assertRefStudioEventsStructure: RecursiveRecord<RefStudioEventName> = RefStudioEvents;

// payload must be passed for event with a non empty payload
export function emitEvent<Event extends RefStudioEventsWithNonEmptyPayload>(
  event: Event,
  payload: RefStudioEventPayload<Event>,
): void;
// no need to pass the payload for events that don't expect a payload
export function emitEvent<Event extends RefStudioEventsWithEmptyPayload>(event: Event, payload?: undefined): void;
export function emitEvent<Event extends RefStudioEventName>(event: Event, payload?: RefStudioEventPayload<Event>) {
  void emit(event, payload);
}

export type RefStudioEventCallback<Event extends RefStudioEventName> = EventCallback<RefStudioEventPayload<Event>>;

export async function listenEvent<Event extends RefStudioEventName>(event: Event, fn: RefStudioEventCallback<Event>) {
  return listen(event, fn);
}
