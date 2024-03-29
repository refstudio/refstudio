import { createStore } from 'jotai';

import { makeFile } from '../../atoms/__tests__/test-fixtures';
import { refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { RefStudioEventName } from '../../events';
import { deleteFile, readAllProjectFiles } from '../../io/filesystem';
import { act, mockListenEvent, setupWithJotaiProvider, waitFor } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');
vi.mock('../../io/filesystem');

const deleteEventName: RefStudioEventName = 'refstudio://explorer/delete';

describe('EventsListener.delete', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(`should listen to ${deleteEventName} events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain<RefStudioEventName>(deleteEventName);
  });

  it(`should delete the file when the ${deleteEventName} event is triggered`, async () => {
    const mockData = mockListenEvent();
    const fileEntry = makeFile('Root File.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
    await store.set(refreshFileTreeAtom);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => mockData.trigger(deleteEventName, { path: fileEntry.path }));

    await waitFor(() => {
      expect(deleteFile).toHaveBeenCalledTimes(1);
    });
    expect(deleteFile).toHaveBeenCalledWith(fileEntry.path);
  });
});
