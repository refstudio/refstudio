import { createStore } from 'jotai';

import { makeFileAndEditor } from '../../atoms/__tests__/test-fixtures';
import { runGetAtomHook } from '../../atoms/__tests__/test-utils';
import { activePaneAtom } from '../../atoms/editorActions';
import { openFileEntryAtom } from '../../atoms/fileEntryActions';
import { EditorData } from '../../atoms/types/EditorData';
import { FileEntry } from '../../atoms/types/FileEntry';
import { PaneEditorId } from '../../atoms/types/PaneGroup';
import { emitEvent, RefStudioEventName } from '../../events';
import { readFileContent } from '../../io/filesystem';
import { act, mockListenEvent, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');
vi.mock('../../io/filesystem');
vi.mock('../../lib/noop');

const menuCloseEventName: RefStudioEventName = 'refstudio://menu/file/close';
const editorCloseEventName: RefStudioEventName = 'refstudio://editors/close';

describe('EventsListener.close', () => {
  let store: ReturnType<typeof createStore>;
  let fileEntry: FileEntry;
  let editorData: EditorData;

  beforeEach(() => {
    vi.mocked(readFileContent).mockResolvedValue({ type: 'text', textContent: 'Lorem Ipsum' });
    store = createStore();

    const file = makeFileAndEditor('File.txt');
    fileEntry = file.fileEntry;
    editorData = file.editorData;

    store.set(openFileEntryAtom, fileEntry);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([{ event: menuCloseEventName }, { event: editorCloseEventName }])(
    'should listen to $event events',
    ({ event }) => {
      const mockData = mockListenEvent();

      setupWithJotaiProvider(<EventsListener />, store);

      expect(mockData.registeredEventNames).toContain(event);
    },
  );

  it(`should trigger ${editorCloseEventName} with correct payload when ${menuCloseEventName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const mockedEmitEvent = vi.mocked(emitEvent);

    const activePaneId = store.get(activePaneAtom).id;

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(menuCloseEventName);
    });

    expect(mockedEmitEvent).toHaveBeenCalledTimes(1);
    expect(mockedEmitEvent).toHaveBeenCalledWith<[string, PaneEditorId]>(editorCloseEventName, {
      editorId: editorData.id,
      paneId: activePaneId,
    });
  });

  it(`should close the given file when ${editorCloseEventName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const activePane = runGetAtomHook(activePaneAtom, store);

    const { fileEntry: fileEntry2, editorData: editorData2 } = makeFileAndEditor('File2.txt');

    act(() => store.set(openFileEntryAtom, fileEntry2));

    expect(activePane.current.openEditorIds).toHaveLength(2);

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(editorCloseEventName, { editorId: editorData.id, paneId: activePane.current.id });
    });

    expect(activePane.current.openEditorIds).toHaveLength(1);
    expect(activePane.current.openEditorIds).toContain(editorData2.id);
  });
});
