import { emit, EventCallback, listen } from '@tauri-apps/api/event';

import { PaneEditorId } from './atoms/types/PaneGroup';
import { NotificationItemType } from './notifications/types';

interface RefStudioEvents {
  'refstudio://menu/file/close': undefined;
  'refstudio://menu/file/save': undefined;
  'refstudio://menu/file/new': undefined;
  'refstudio://menu/settings': undefined;
  'refstudio://menu/references/open': undefined;
  'refstudio://menu/references/upload': undefined;
  'refstudio://menu/references/export': undefined;
  'refstudio://menu/view/notifications': undefined;
  'refstudio://editors/close': PaneEditorId;
  'refstudio://references/ingestion/run': undefined;
  'refstudio://references/remove': { referenceIds: string[] };
  'refstudio://references/load': undefined;
  'refstudio://explorer/delete': { path: string };
  'refstudio://notifications/clear': { type?: NotificationItemType };
  'refstudio://notifications/new': { type: NotificationItemType; title: string; details?: string };
  'refstudio://notifications/popup/open': { type?: NotificationItemType };
  'refstudio://notifications/popup/close': undefined;
  'refstudio://explorer/rename': { path: string; newName?: string };
  'refstudio://ai/suggestion/insert': { text: string };
  'refstudio://layout/update': undefined;
}

export type RefStudioEventName = keyof RefStudioEvents;

export type RefStudioEventPayload<Event extends RefStudioEventName> = RefStudioEvents[Event];

type RefStudioEventsWithNonEmptyPayload<Event = RefStudioEventName> = Event extends RefStudioEventName
  ? RefStudioEventPayload<Event> extends undefined
    ? never
    : Event
  : never;

type RefStudioEventsWithEmptyPayload = Exclude<RefStudioEventName, RefStudioEventsWithNonEmptyPayload>;

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
