/** Stubs for @tauri-apps/api/event */

import * as tauriEvent from '@tauri-apps/api/event';

import { noop } from '../../lib/noop';

const listeners = new Map<string, tauriEvent.EventCallback<unknown>[]>();

export const emit: typeof tauriEvent.emit = (event, payload) => {
  const handlers = listeners.get(event);
  if (handlers) {
    handlers.forEach((handler) => handler({ event, payload, id: 0, windowLabel: 'refstudio' }));
  }
  return Promise.resolve();
};

// Included to allow simulation of events from the dev tools console.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).emitEvent = emit;

export const listen: typeof tauriEvent.listen = (event, callback) => {
  const handlers = listeners.get(event) ?? [];
  listeners.set(event, [...handlers, callback as tauriEvent.EventCallback<unknown>]);
  return Promise.resolve(noop);
};
