import { createStore } from 'jotai';

import { RefStudioEventName } from '../../events';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');

const menuDebugConsoleClearEventName: RefStudioEventName = 'refstudio://menu/debug/console/clear';

describe('EventsListener.debug', () => {
  let store: ReturnType<typeof createStore>;
  const { clear } = console;

  beforeEach(() => {
    store = createStore();
    console.clear = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    console.clear = clear;
  });

  it.each([{ event: menuDebugConsoleClearEventName }])('should listen to $event events', ({ event }) => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain(event);
  });

  it(`should clear console when ${menuDebugConsoleClearEventName} event is triggered`, () => {
    const mockData = mockListenEvent();
    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(menuDebugConsoleClearEventName);
    });

    expect(vi.mocked(console.clear)).toHaveBeenCalledTimes(1);
  });
});
