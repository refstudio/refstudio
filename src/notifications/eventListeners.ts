import { useSetAtom } from 'jotai';

import { addNotificationAtom, clearNotificationsAtom } from '../atoms/notificationsState';
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
