export type NotificationItemType = 'info' | 'warning' | 'error';

export interface MutableNotificationItem {
  type: NotificationItemType;
  id: string;
  when: string;
  title: string;
  details?: string;
}

export type NotificationItem = Readonly<MutableNotificationItem>;
