/**
 * Utility effect to listen for RefStudio events
 *
 * @param event the event name
 * @param callback the event callback function
 */

import { listenEvent } from '../events';
import { useAsyncEffect } from './useAsyncEffect';

export function useListenEvent<Payload>(eventName: string, callback: (p: Payload) => void) {
  useAsyncEffect(
    (isMounted) =>
      listenEvent<Payload>(eventName, (evt) => {
        if (isMounted()) {
          callback(evt.payload);
        }
      }),
    (releaseHandle) => releaseHandle(),
  );
}
