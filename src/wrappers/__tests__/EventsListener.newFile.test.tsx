import { createStore } from 'jotai';

import { runGetAtomHook } from '../../atoms/__tests__/test-utils';
import { activePaneContentAtom } from '../../atoms/paneActions';
import { RefStudioEventName } from '../../events';
import { act, mockListenEvent, setupWithJotaiProvider, waitFor } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');
vi.mock('../../io/filesystem');

describe('EventsListener.close', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(`should listen to refstudio://menu/file/new events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain<RefStudioEventName>('refstudio://menu/file/new');
  });

  it(`should create a new file when refstudio://menu/file/new event is triggered`, async () => {
    const mockData = mockListenEvent();
    const activePaneContent = runGetAtomHook(activePaneContentAtom, store);

    expect(activePaneContent.current.openEditors).toHaveLength(0);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger('refstudio://menu/file/new'));

    await waitFor(() => {
      expect(activePaneContent.current.openEditors).toHaveLength(1);
    });
  });
});
