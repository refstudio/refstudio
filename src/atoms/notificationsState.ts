import { atom } from 'jotai';

import { generateId } from '../lib/generateId';
import { NotificationItem, NotificationItemType } from '../notifications/types';

/**
 * List of notification items sorted descending of creation time (most recent in the begining)
 */
const notificationsAtom = atom<NotificationItem[]>([]);
const readOnlyNotificationsAtom = atom<readonly Readonly<NotificationItem>[]>((get) => get(notificationsAtom));

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

export const latestNotificationAtom = atom((get) => get(readOnlyNotificationsAtom)[0]);

export const listNotificationsAtom = atom<readonly Readonly<NotificationItem>[]>((get) => get(notificationsAtom));

export const notificationsTypeStatsAtom = atom((get) => {
  const stats: Record<NotificationItemType, number> = {
    info: 0,
    warning: 0,
    error: 0,
  };
  get(readOnlyNotificationsAtom).forEach((n) => (stats[n.type] += 1));
  return stats;
});

export const addNotificationAtom = atom(
  null,
  (get, set, type: NotificationItemType, title: string, details?: string) => {
    const notifications = get(notificationsAtom);
    const notification: NotificationItem = {
      id: generateId(10),
      when: new Date().toISOString(),
      type,
      title,
      details,
    };
    set(notificationsAtom, [notification, ...notifications]);
  },
);
