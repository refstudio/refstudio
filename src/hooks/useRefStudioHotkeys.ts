/**
 * Utility effect to listen for RefStudio events
 *
 * @param event the event name
 * @param callback the event callback function
 */

import { useHotkeys } from 'react-hotkeys-hook';
import type { Keys, OptionsOrDependencyArray } from 'react-hotkeys-hook/dist/types';

import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../events';

/**
 * Configure keyboard shortcut with some arbitrary handler.
 * Note that this will run both for desktop and web
 *
 * @param keys keyboard shortcut configurations
 * @param handler handler executed on shortcut press
 * @param onlyForWeb if true, keyboard shortcut is only configured for the web
 */
export function useRefStudioHotkeys(keys: Keys, handler: () => void, onlyForWeb = false) {
  const options: OptionsOrDependencyArray = {
    enableOnContentEditable: true,
    preventDefault: true,
    splitKey: '#',
    enabled: !onlyForWeb ? true : !!import.meta.env.VITE_IS_WEB,
  };

  useHotkeys(keys, handler, options);
}

/**
 *
 * @param keys keyboard shortcut configurations
 * @param onlyForWeb if true, keyboard shortcut is only configured for the web
 * @param eventName ref studio event name
 * @param eventPayload ref studio event payload
 */
export function useRefStudioEventHotkeys<Event extends RefStudioEventName>(
  keys: Keys,
  onlyForWeb: boolean,
  eventName: Event,
  ...eventPayload: RefStudioEventPayload<Event> extends undefined ? [] : [payload: RefStudioEventPayload<Event>]
) {
  const options: OptionsOrDependencyArray = {
    enableOnContentEditable: true,
    preventDefault: true,
    splitKey: '#',
    enabled: !onlyForWeb ? true : !!import.meta.env.VITE_IS_WEB,
  };

  useHotkeys(
    keys,
    () => {
      emitEvent(eventName, ...eventPayload);
    },
    options,
  );
}
