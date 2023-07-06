import { createStore } from 'jotai';

import { runGetAtomHook } from '../../atoms/__tests__/test-utils';
import { activePaneContentAtom } from '../../atoms/paneActions';
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

  it(`should create a new file when ${newFileEventName} event is triggered`, async () => {
    const mockData = mockListenEvent();
    const activePaneContent = runGetAtomHook(activePaneContentAtom, store);

    expect(activePaneContent.current.openEditors).toHaveLength(0);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(newFileEventName));

    await waitFor(() => {
      expect(activePaneContent.current.openEditors).toHaveLength(1);
    });
  });
});
