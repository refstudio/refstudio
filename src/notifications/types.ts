export type NotificationItemType = 'info' | 'warning' | 'error';

export interface NotificationItem {
  type: NotificationItemType;
  id: string;
  when: string;
  title: string;
  details?: string;
}

export type ReadonlyNotificationItem = Readonly<NotificationItem>;
