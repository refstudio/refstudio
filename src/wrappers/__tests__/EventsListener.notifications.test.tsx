import { createStore } from 'jotai';

import { runGetAtomHook } from '../../atoms/__tests__/test-utils';
import { listNotificationsAtom } from '../../atoms/notificationsState';
import { RefStudioEventName } from '../../events';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');

const newNotificationName: RefStudioEventName = 'refstudio://notifications/new';
const clearNotificationsName: RefStudioEventName = 'refstudio://notifications/clear';

describe('EventsListener.notifications', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(`should listen to ${newNotificationName} and ${clearNotificationsName} events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(newNotificationName);
    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(clearNotificationsName);
  });

  it(`should create a new notification when ${newNotificationName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const notifications = runGetAtomHook(listNotificationsAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(newNotificationName, { type: 'info', title: 'title', details: 'details' }));

    expect(notifications.current).toHaveLength(1);
    expect(notifications.current[0]).toMatchObject({ type: 'info', title: 'title', details: 'details' });
  });
});
