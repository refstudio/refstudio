import { createStore } from 'jotai';

import { makeFile } from '../../atoms/__tests__/test-fixtures';
import { runGetAtomHook } from '../../atoms/__tests__/test-utils';
import { fileExplorerEntryPathBeingRenamed, refreshFileTreeAtom } from '../../atoms/fileExplorerActions';
import { RefStudioEventName } from '../../events';
import { readAllProjectFiles, renameFile } from '../../io/filesystem';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');
vi.mock('../../io/filesystem');


const renameEventName: RefStudioEventName = 'refstudio://explorer/rename';

describe('EventsListener.rename', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(`should listen to ${renameEventName} events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain(renameEventName);
  });

  it(`should mark the given file as being renamed when ${renameEventName} is triggered with just a path`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    const path = 'path/to/file.txt';

    const filePathBeingRenamed = runGetAtomHook(fileExplorerEntryPathBeingRenamed, store);

    expect(filePathBeingRenamed.current).toBeNull();

    act(() => mockData.trigger(renameEventName, { path }));

    expect(filePathBeingRenamed.current).toBe(path);
  });

  it(`should call rename when ${renameEventName} is triggered with a newName`, async () => {
    const fileEntry = makeFile('File.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
    await store.set(refreshFileTreeAtom);

    vi.mocked(renameFile).mockResolvedValueOnce({ success: true, newPath: '' });

    const mockData = mockListenEvent();
    setupWithJotaiProvider(<EventsListener />, store);

    const newName = 'Updated File.txt';
    act(() => mockData.trigger(renameEventName, { path: fileEntry.path, newName }));

    expect(renameFile).toHaveBeenCalledTimes(1);
    expect(renameFile).toHaveBeenCalledWith(fileEntry.path, newName);
  });
});