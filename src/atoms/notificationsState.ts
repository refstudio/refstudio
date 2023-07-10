import { atom } from 'jotai';

import { generateId } from '../lib/generateId';
import { NotificationItemType, ReadonlyNotificationItem } from '../notifications/types';

/**
 * Core database
 *
 * List of notification items sorted descending of creation time (most recent in the begining)
 */
const notificationsAtom = atom<readonly ReadonlyNotificationItem[]>([]);

export const clearNotificationsAtom = atom(null, (get, set, type?: NotificationItemType) => {
  if (!type) {
    set(notificationsAtom, []);
  }
  set(
    notificationsAtom,
    get(notificationsAtom).filter((n) => n.type !== type),
  );
});

export const hasNotificationsAtom = atom((get) => get(notificationsAtom).length > 0);
export const latestNotificationAtom = atom((get) => {
  const notifications = get(listNotificationsAtom);
  if (notifications.length === 0) {
    throw new Error('Notifications list is empty. Ensure you call hasNotificationsAtom before');
  }
  return notifications[0];
});

export const listNotificationsAtom = atom<readonly ReadonlyNotificationItem[]>((get) => get(notificationsAtom));

export const notificationsTypeStatsAtom = atom((get) => {
  const stats: Record<NotificationItemType, number> = {
    info: 0,
    warning: 0,
    error: 0,
  };
  get(notificationsAtom).forEach((n) => (stats[n.type] += 1));
  return stats;
});

export const addNotificationAtom = atom(
  null,
  (get, set, type: NotificationItemType, title: string, details?: string) => {
    const notifications = get(notificationsAtom);
    const notification: ReadonlyNotificationItem = {
      id: generateId(10),
      when: new Date().toISOString(),
      type,
      title,
      details,
    };
    set(notificationsAtom, [notification, ...notifications]);
  },
);

/**
 * Open/Closed notifications popup
 *
 * Controls if the notification popup is open and what type of notification should be shown (if any)
 */
export const notificationsPopupAtom = atom<{ open: boolean; type?: NotificationItemType }>({ open: false });
