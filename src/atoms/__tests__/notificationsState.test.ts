import { act } from '@testing-library/react';
import { createStore } from 'jotai';

import { NotificationItemType } from '../../notifications/types';
import {
  addNotificationAtom,
  clearNotificationsAtom,
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

  const TOTAL_INFO = 3;
  const TOTAL_WARNING = 4;
  const TOTAL_ERROR = 2;
  const TOTAL = TOTAL_INFO + TOTAL_WARNING + TOTAL_ERROR;
  it.each<{ expectedLengthAfterClear: number; type?: NotificationItemType }>([
    { expectedLengthAfterClear: 0, type: undefined },
    { expectedLengthAfterClear: TOTAL - TOTAL_INFO, type: 'info' },
    { expectedLengthAfterClear: TOTAL - TOTAL_WARNING, type: 'warning' },
    { expectedLengthAfterClear: TOTAL - TOTAL_ERROR, type: 'error' },
  ])('should clear all $type notifications', ({ type, expectedLengthAfterClear }) => {
    const addNotification = runSetAtomHook(addNotificationAtom, store);
    const notifications = runGetAtomHook(listNotificationsAtom, store);
    const clearNotifications = runSetAtomHook(clearNotificationsAtom, store);

    act(() => {
      addNotification.current('info', 'title 1', 'details 1');
      addNotification.current('info', 'title 2', 'details 2');
      addNotification.current('info', 'title 3', 'details 3');
      addNotification.current('warning', 'title warning 1', 'details warning 1');
      addNotification.current('warning', 'title warning 2', 'details warning 2');
      addNotification.current('warning', 'title warning 3', 'details warning 3');
      addNotification.current('warning', 'title warning 4', 'details warning 4');
      addNotification.current('error', 'error 1', 'details error 1');
      addNotification.current('error', 'error 2', 'details error 2');
    });

    expect(notifications.current).not.toHaveLength(0);
    act(() => clearNotifications.current(type));
    expect(notifications.current).toHaveLength(expectedLengthAfterClear);
  });
});
