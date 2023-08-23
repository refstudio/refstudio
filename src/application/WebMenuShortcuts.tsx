import { useHotkeys } from 'react-hotkeys-hook';
import type { OptionsOrDependencyArray } from 'react-hotkeys-hook/dist/types';

import { emitEvent, RefStudioEventName, RefStudioEventPayload } from '../events';

/**
 * Add keyboard shortcuts to the app.
 *
 *  NOTE: Some shortcuts can+t be added to the app
 *    - ⌘ + N - replaced by Ctrl + N
 *    - ⌘ + W - replaced by Ctrl + W
 *
 *  WARNING:  https://react-hotkeys-hook.vercel.app/docs/documentation/useHotkeys/basic-usage
 *  > Please be aware that there are some hotkeys that we cannot override,
 *    because they would interfere with a safe browsing experience for the user.
 *    These depend on the browser. For example in Chrome, most notably those are
 *    meta + w which closes a tab, meta + n for opening a new window and
 *    meta + t to open a new tab. Additionally meta + shift + w (closing all tabs of the current window),
 *    meta + shift + n (opening incognito window) and meta + shift + t (reopen the last closed tab)
 *    cannot be overridden.
 *    meta + up + 1..9 on the other hand focuses the corresponding tab of the active window and
 *    also cannot be overridden.
 */
export function WebMenuShortcuts() {
  // RefStudio
  useMenuEventHotKeyForWeb(['meta+,'], 'refstudio://menu/settings');
  // File
  useMenuEventHotKeyForWeb(['ctrl+n'], 'refstudio://menu/file/new');
  useMenuEventHotKeyForWeb(['ctrl+s', 'meta+s'], 'refstudio://menu/file/save');
  useMenuEventHotKeyForWeb(['ctrl+w'], 'refstudio://menu/file/close');
  // References
  useMenuEventHotKeyForWeb(['meta+r'], 'refstudio://menu/references/open');
  // Notifications
  useMenuEventHotKeyForWeb(['F11'], 'refstudio://menu/view/notifications');

  return <></>;
}
function useMenuEventHotKeyForWeb<Event extends RefStudioEventName>(
  keys: string[],
  eventName: Event,
  ...args: RefStudioEventPayload<Event> extends undefined ? [] : [payload: RefStudioEventPayload<Event>]
) {
  const options: OptionsOrDependencyArray = {
    enableOnContentEditable: true,
    preventDefault: true,
    splitKey: '#',
    enabled: !!import.meta.env.VITE_IS_WEB, // safeguard that this only works for web
  };

  useHotkeys(
    keys,
    () => {
      emitEvent(eventName, ...args);
    },
    options,
  );
}
