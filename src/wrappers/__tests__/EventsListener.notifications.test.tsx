import { createStore } from 'jotai';

import { runGetAtomHook } from '../../atoms/__tests__/test-utils';
import { listNotificationsAtom, notificationsPopupAtom } from '../../atoms/notificationsState';
import { RefStudioEventName } from '../../events';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');

const newNotificationName: RefStudioEventName = 'refstudio://notifications/new';
const clearNotificationsName: RefStudioEventName = 'refstudio://notifications/clear';
const showNotificationsName: RefStudioEventName = 'refstudio://notifications/popup/open';
const hideNotificationsName: RefStudioEventName = 'refstudio://notifications/popup/close';
const menuViewNotificationsName: RefStudioEventName = 'refstudio://menu/view/notifications';

describe('EventsListener.notifications', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(`should listen to ${[
    newNotificationName,
    clearNotificationsName,
    showNotificationsName,
    hideNotificationsName,
    menuViewNotificationsName,
  ].join(', ')} events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(newNotificationName);
    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(clearNotificationsName);
    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(showNotificationsName);
    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(hideNotificationsName);
    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(menuViewNotificationsName);
  });

  it(`should create a new notification when ${newNotificationName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const notifications = runGetAtomHook(listNotificationsAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(newNotificationName, { type: 'info', title: 'title', details: 'details' }));

    expect(notifications.current).toHaveLength(1);
    expect(notifications.current[0]).toMatchObject({ type: 'info', title: 'title', details: 'details' });
  });

  it(`Should show notifications popup when ${showNotificationsName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const notificationsPopup = runGetAtomHook(notificationsPopupAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(showNotificationsName, { type: 'error' }));

    expect(notificationsPopup.current).toStrictEqual({ open: true, type: 'error' });
  });

  it(`Should hide notifications popup when ${hideNotificationsName} event is triggered`, () => {
    const mockData = mockListenEvent();
    store.set(notificationsPopupAtom, { open: true, type: 'info' });

    setupWithJotaiProvider(<EventsListener />, store);
    const notificationsPopup = runGetAtomHook(notificationsPopupAtom, store);

    act(() => mockData.trigger(hideNotificationsName));

    expect(notificationsPopup.current.open).toBeFalsy();
  });

  it(`Should show notifications popup when ${menuViewNotificationsName} event is triggered`, () => {
    const mockData = mockListenEvent();
    store.set(notificationsPopupAtom, { open: false });
    const notificationsPopup = runGetAtomHook(notificationsPopupAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(menuViewNotificationsName));

    expect(notificationsPopup.current.open).toBeTruthy();
  });

  it(`Should hide notifications popup when ${menuViewNotificationsName} event is triggered`, () => {
    const mockData = mockListenEvent();
    store.set(notificationsPopupAtom, { open: true });
    const notificationsPopup = runGetAtomHook(notificationsPopupAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(menuViewNotificationsName));

    expect(notificationsPopup.current.open).toBeFalsy();
  });
});
