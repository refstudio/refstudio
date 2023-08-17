/** Stubs for @tauri-apps/api/event */

import * as tauriEvent from '@tauri-apps/api/event';

const listeners = new Map<string, tauriEvent.EventCallback<unknown>>();

export const emit: typeof tauriEvent.emit = (event, payload) => {
  const handler = listeners.get(event);
  if (handler) {
    handler({ event, payload, id: 0, windowLabel: 'refstudio' });
  }
  return Promise.resolve();
};

// Included to allow simulation of events from the dev tools console.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).emitEvent = emit;

export const listen: typeof tauriEvent.listen = (event, callback) => {
  listeners.set(event, callback as tauriEvent.EventCallback<unknown>);
  return Promise.resolve(() => {
    /* no op */
  });
};
