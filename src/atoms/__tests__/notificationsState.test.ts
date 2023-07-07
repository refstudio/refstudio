import { act } from '@testing-library/react';
import { createStore } from 'jotai';

import { NotificationItemType } from '../../notifications/types';
import {
  addNotificationAtom,
  hasNotificationsAtom,
  latestNotificationAtom,
  listNotificationsAtom,
} from '../notificationsState';
import { runGetAtomHook, runSetAtomHook } from './test-utils';

describe('notificationsState', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start empty', () => {
    const notifications = runGetAtomHook(listNotificationsAtom, store);
    const hasNotifications = runGetAtomHook(hasNotificationsAtom, store);
    expect(notifications.current).toHaveLength(0);
    expect(hasNotifications.current).toBeFalsy();
  });

  it.each<{ type: NotificationItemType }>([{ type: 'info' }, { type: 'warning' }, { type: 'error' }])(
    'should add $type notification',
    ({ type }) => {
      const addNotification = runSetAtomHook(addNotificationAtom, store);
      const notifications = runGetAtomHook(listNotificationsAtom, store);

      act(() => addNotification.current(type, 'title'));

      expect(notifications.current).toHaveLength(1);
      const [first] = notifications.current;
      expect(first.type).toBe(type);
      expect(first.title).toBe('title');
      expect(first.details).toBeUndefined();
    },
  );

  it('should read the latest notification', () => {
    const addNotification = runSetAtomHook(addNotificationAtom, store);

    act(() => addNotification.current('info', 'title'));

    const latestNotification = runGetAtomHook(latestNotificationAtom, store);
    expect(latestNotification.current).toBeDefined();
  });

  it('should throw in latest notification if empty', () => {
    expect(() => runGetAtomHook(latestNotificationAtom, store).current).toThrowError();
  });

  it('should have details', () => {
    const addNotification = runSetAtomHook(addNotificationAtom, store);

    act(() => addNotification.current('info', 'title', 'details'));

    const latestNotification = runGetAtomHook(latestNotificationAtom, store);
    expect(latestNotification.current.details).toBeDefined();
    expect(latestNotification.current.details).toBe('details');
  });
});
