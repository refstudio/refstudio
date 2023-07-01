/**
 * Utility effect to listen for RefStudio events
 *
 * @param event the event name
 * @param callback the event callback function
 */

import { listenEvent, RefStudioEventName, RefStudioEventPayload } from '../events';
import { useAsyncEffect } from './useAsyncEffect';

export function useListenEvent<Event extends RefStudioEventName>(
  eventName: Event,
  callback: (p: RefStudioEventPayload<Event>) => void,
) {
  useAsyncEffect(
    (isMounted) =>
      listenEvent<Event>(eventName, (evt) => {
        if (isMounted()) {
          callback(evt.payload);
        }
      }),
    (releaseHandle) => releaseHandle(),
  );
}
