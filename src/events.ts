import type { EventCallback } from '@tauri-apps/api/event';

import { PaneEditorId, PaneId } from './atoms/types/PaneGroup';
import { NotificationItemType } from './notifications/types';
import { emit, listen } from './wrappers/tauri-wrapper';

interface RefStudioEvents {
  // Menu actions (Note that these should have undefined payload)
  'refstudio://menu/file/new': undefined;
  'refstudio://menu/file/save': undefined;
  'refstudio://menu/file/markdown': undefined;
  'refstudio://menu/file/close': undefined;
  'refstudio://menu/file/close/all': undefined;
  'refstudio://menu/settings': undefined;
  'refstudio://menu/references/open': undefined;
  'refstudio://menu/references/upload': undefined;
  'refstudio://menu/references/export': undefined;
  'refstudio://menu/view/notifications': undefined;
  'refstudio://menu/debug/console/clear': undefined;
  'refstudio://menu/file/project/new': undefined;
  'refstudio://menu/file/project/new/sample': undefined;
  'refstudio://menu/file/project/open': undefined;
  'refstudio://menu/file/project/close': undefined;
  // Editor actions
  'refstudio://editors/close': PaneEditorId;
  'refstudio://editors/move': { fromPaneEditorId: PaneEditorId; toPaneId: PaneId };
  // References actions
  'refstudio://references/ingestion/run': undefined;
  'refstudio://references/remove': { referenceIds: string[] };
  // Explorer actions
  'refstudio://explorer/delete': { path: string };
  'refstudio://explorer/rename': { path: string; newName?: string };
  // Notifications actions
  'refstudio://notifications/clear': { type?: NotificationItemType };
  'refstudio://notifications/new': { type: NotificationItemType; title: string; details?: string };
  'refstudio://notifications/popup/open': { type?: NotificationItemType };
  'refstudio://notifications/popup/close': undefined;
  // Ai actions
  'refstudio://ai/suggestion/insert': { text: string };
  // Layout actions
  'refstudio://layout/update': undefined;
}

export type RefStudioEventName = keyof RefStudioEvents;

export type RefStudioEventPayload<Event extends RefStudioEventName> = RefStudioEvents[Event];

export function emitEvent<Event extends RefStudioEventName>(
  event: Event,
  ...args: RefStudioEventPayload<Event> extends undefined ? [] : [payload: RefStudioEventPayload<Event>]
) {
  void emit(event, ...args);
}

export type RefStudioEventCallback<Event extends RefStudioEventName> = EventCallback<RefStudioEventPayload<Event>>;

export async function listenEvent<Event extends RefStudioEventName>(event: Event, fn: RefStudioEventCallback<Event>) {
  return listen(event, fn);
}
