import { createStore } from 'jotai';

import { runHookWithJotaiProvider } from '../../atoms/__tests__/test-utils';
import { usePaneOpenEditorsCount } from '../../atoms/hooks/usePaneOpenEditorsCount';
import { RefStudioEventName } from '../../events';
import { act, mockListenEvent, setupWithJotaiProvider, waitFor } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');

const newFileEventName: RefStudioEventName = 'refstudio://menu/file/new';

describe('EventsListener.close', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(`should listen to ${newFileEventName} events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(newFileEventName);
  });

  it(`should create a new file in the LEFT pane when ${newFileEventName} event is triggered`, async () => {
    const mockData = mockListenEvent();

    const activePaneContentOpenEditorsCount = runHookWithJotaiProvider(() => usePaneOpenEditorsCount('LEFT'), store);

    expect(activePaneContentOpenEditorsCount.current).toBe(0);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(newFileEventName));

    await waitFor(() => {
      expect(activePaneContentOpenEditorsCount.current).toBe(1);
    });
  });
});
