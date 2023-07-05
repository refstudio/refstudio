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
          // Note: The payload is null when there is no payload.
          //       This will break our implementation (typing),
          //       so we need to make the fallback and cast
          const payload = (evt.payload ?? undefined) as RefStudioEventPayload<Event>;
          callback(payload);
        }
      }),
    (releaseHandle) => releaseHandle(),
  );
}
