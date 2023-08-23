import { useRefStudioEventHotkeys } from '../hooks/useRefStudioHotkeys';

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
  useRefStudioEventHotkeys(['meta+,'], true, 'refstudio://menu/settings');
  // File
  useRefStudioEventHotkeys(['ctrl+n'], true, 'refstudio://menu/file/new');
  useRefStudioEventHotkeys(['ctrl+s', 'meta+s'], true, 'refstudio://menu/file/save');
  useRefStudioEventHotkeys(['ctrl+w'], true, 'refstudio://menu/file/close');
  // References
  useRefStudioEventHotkeys(['meta+r'], true, 'refstudio://menu/references/open');
  // Notifications
  useRefStudioEventHotkeys(['F11'], true, 'refstudio://menu/view/notifications');

  return <></>;
}
