import { createStore } from 'jotai';

import { makeFileAndEditor } from '../../atoms/__tests__/test-fixtures';
import { runHookWithJotaiProvider } from '../../atoms/__tests__/test-utils';
import { openFileEntryAtom } from '../../atoms/fileEntryActions';
import { useOpenEditorsCountForPane } from '../../atoms/hooks/useOpenEditorsCountForPane';
import { FileEntry } from '../../atoms/types/FileEntry';
import { RefStudioEventName } from '../../events';
import { readFileContent } from '../../io/filesystem';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');
vi.mock('../../io/filesystem');
vi.mock('../../lib/noop');

const editorsMoveEventName: RefStudioEventName = 'refstudio://editors/move';

describe('EventsListener.move', () => {
  let store: ReturnType<typeof createStore>;
  let fileEntry: FileEntry;

  beforeEach(() => {
    vi.mocked(readFileContent).mockResolvedValue({ type: 'refstudio', jsonContent: { doc: 'Lorem Ipsum' } });
    store = createStore();

    const file = makeFileAndEditor('File.refstudio');
    fileEntry = file.fileEntry;

    store.set(openFileEntryAtom, fileEntry);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([{ event: editorsMoveEventName }])('should listen to $event events', ({ event }) => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain(event);
  });

  it(`should move editor to RIGHT pane when ${editorsMoveEventName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const leftPaneOpenEditorsCount = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('LEFT'), store);
    const rightPaneOpenEditorsCount = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('RIGHT'), store);

    const { fileEntry: fileEntry2, editorData: editorData2 } = makeFileAndEditor('File2.refstudio');

    act(() => store.set(openFileEntryAtom, fileEntry2));

    expect(leftPaneOpenEditorsCount.current).toBe(2);
    expect(rightPaneOpenEditorsCount.current).toBe(0);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(editorsMoveEventName, {
        fromPaneEditorId: { editorId: editorData2.id, paneId: 'LEFT' },
        toPaneId: 'RIGHT',
      });
    });

    expect(leftPaneOpenEditorsCount.current).toBe(1);
    expect(rightPaneOpenEditorsCount.current).toBe(1);
  });

  it(`should move editor to LEFT pane when ${editorsMoveEventName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const leftPaneOpenEditorsCount = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('LEFT'), store);
    const rightPaneOpenEditorsCount = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('RIGHT'), store);

    const { fileEntry: fileEntry2, editorData: editorData2 } = makeFileAndEditor('File2.pdf');

    act(() => store.set(openFileEntryAtom, fileEntry2));

    expect(leftPaneOpenEditorsCount.current).toBe(1);
    expect(rightPaneOpenEditorsCount.current).toBe(1);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(editorsMoveEventName, {
        fromPaneEditorId: { editorId: editorData2.id, paneId: 'RIGHT' },
        toPaneId: 'LEFT',
      });
    });

    expect(leftPaneOpenEditorsCount.current).toBe(2);
    expect(rightPaneOpenEditorsCount.current).toBe(0);
  });
});
