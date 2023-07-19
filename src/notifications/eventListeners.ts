import { useAtom, useSetAtom } from 'jotai';

import { addNotificationAtom, clearNotificationsAtom, notificationsPopupAtom } from '../atoms/notificationsState';
import { RefStudioEventPayload } from '../events';

export function useCreateNotificationListener() {
  const addNotification = useSetAtom(addNotificationAtom);

  return (payload: RefStudioEventPayload<'refstudio://notifications/new'>) =>
    addNotification(payload.type, payload.title, payload.details);
}

export function useClearNotificationsListener() {
  const clearNotifications = useSetAtom(clearNotificationsAtom);

  return (payload: RefStudioEventPayload<'refstudio://notifications/clear'>) => clearNotifications(payload.type);
}

// Popup

export function useShowNotificationsPopupListener() {
  const setNotificationsPopup = useSetAtom(notificationsPopupAtom);
  return (payload: RefStudioEventPayload<'refstudio://notifications/popup/open'>) =>
    setNotificationsPopup({ open: true, type: payload.type });
}

export function useHideNotificationsPopupListener() {
  const notificationsPopup = useSetAtom(notificationsPopupAtom);
  return () => notificationsPopup({ open: false });
}

/** This is a listener of TAURI's menu events. */
export function useTauriViewNotificationMenuListener() {
  const [notificationsPopup, setNotificationsPopup] = useAtom(notificationsPopupAtom);
  return () =>
    notificationsPopup.open
      ? setNotificationsPopup({ open: false }) // toggle visibility
      : setNotificationsPopup({ open: true, type: undefined }); // All types}
}
