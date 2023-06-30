import { createStore } from 'jotai';

import { activePaneAtom, openFileEntryAtom } from '../../atoms/editorActions';
import { makeFile } from '../../atoms/test-fixtures';
import { runGetAtomHook } from '../../atoms/test-utils';
import { EditorData } from '../../atoms/types/EditorData';
import { FileEntry } from '../../atoms/types/FileEntry';
import { PaneEditorId } from '../../atoms/types/PaneGroup';
import { emitEvent, RefStudioEvents } from '../../events';
import { readFileContent } from '../../io/filesystem';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../events');
vi.mock('../io/filesystem');
vi.mock('../lib/noop');

describe('EventsListener.close', () => {
  let store: ReturnType<typeof createStore>;
  let fileEntry: FileEntry;
  let editorData: EditorData;

  beforeEach(() => {
    vi.mocked(readFileContent).mockResolvedValue({ type: 'text', textContent: 'Lorem Ipsum' });
    store = createStore();

    const file = makeFile('File.txt');
    fileEntry = file.fileEntry;
    editorData = file.editorData;

    store.set(openFileEntryAtom, fileEntry);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.skip.each([{ event: RefStudioEvents.menu.file.close }, { event: RefStudioEvents.editors.close }])(
    'should listen to $event events',
    ({ event }) => {
      const mockData = mockListenEvent();

      setupWithJotaiProvider(<EventsListener />, store);

      expect(mockData.registeredEventNames).toContain(event);
    },
  );

  it(`should trigger ${RefStudioEvents.editors.close} with correct payload when ${RefStudioEvents.menu.file.close} event is triggered`, () => {
    const mockData = mockListenEvent();
    const mockedEmitEvent = vi.mocked(emitEvent);

    const activePaneId = store.get(activePaneAtom).id;

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(RefStudioEvents.menu.file.close);
    });

    expect(mockedEmitEvent).toHaveBeenCalledTimes(1);
    expect(mockedEmitEvent).toHaveBeenCalledWith<[string, PaneEditorId]>(RefStudioEvents.editors.close, {
      editorId: editorData.id,
      paneId: activePaneId,
    });
  });

  it(`should close the given file when ${RefStudioEvents.editors.close} event is triggered`, () => {
    const mockData = mockListenEvent<PaneEditorId>();
    const activePane = runGetAtomHook(activePaneAtom, store);

    const { fileEntry: fileEntry2, editorData: editorData2 } = makeFile('File2.txt');

    act(() => store.set(openFileEntryAtom, fileEntry2));

    expect(activePane.current.openEditorIds).toHaveLength(2);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(RefStudioEvents.editors.close, { editorId: editorData.id, paneId: activePane.current.id });
    });

    expect(activePane.current.openEditorIds).toHaveLength(1);
    expect(activePane.current.openEditorIds).toContain(editorData2.id);
  });
});
