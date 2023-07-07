import { createStore } from 'jotai';

import { makeFileAndEditor } from '../../atoms/__tests__/test-fixtures';
import { runSetAtomHook } from '../../atoms/__tests__/test-utils';
import { activePaneAtom, closeEditorFromPaneAtom } from '../../atoms/editorActions';
import { openFileEntryAtom } from '../../atoms/fileEntryActions';
import { activePaneContentAtom } from '../../atoms/paneActions';
import { EditorData } from '../../atoms/types/EditorData';
import { FileEntry } from '../../atoms/types/FileEntry';
import { RefStudioEventName } from '../../events';
import { readFileContent, writeFileContent } from '../../io/filesystem';
import { asyncNoop } from '../../lib/noop';
import { act, mockListenEvent, screen, setupWithJotaiProvider } from '../../test/test-utils';
import { EventsListener } from '../EventsListener';

vi.mock('../../events');
vi.mock('../../io/filesystem');
vi.mock('../../lib/noop');

describe('EventsListener.save', () => {
  let store: ReturnType<typeof createStore>;
  let fileEntry: FileEntry;
  let editorData: EditorData;

  const saveEventName: RefStudioEventName = 'refstudio://menu/file/save';

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

  it('should render children', () => {
    setupWithJotaiProvider(<EventsListener>Child</EventsListener>, store);

    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it(`should listen to ${saveEventName} events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventNames).toContain(saveEventName);
  });

  it(`should call saveFile when ${saveEventName} event is triggered`, () => {
    const mockData = mockListenEvent();
    const activePaneContent = store.get(activePaneContentAtom);
    const { updateEditorContentBufferAtom } = activePaneContent.activeEditor!.contentAtoms;

    const updateFileBuffer = runSetAtomHook(updateEditorContentBufferAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    const updatedContent = 'Updated content';

    act(() => {
      updateFileBuffer.current({ type: 'text', textContent: updatedContent });
      mockData.trigger(saveEventName);
    });

    expect(writeFileContent).toHaveBeenCalledTimes(1);
    expect(writeFileContent).toHaveBeenCalledWith(fileEntry.path, updatedContent);
  });

  it(`should not call saveFile when ${saveEventName} event is triggered without content changes`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(saveEventName);
    });

    expect(writeFileContent).toHaveBeenCalledTimes(0);
  });

  it(`should call asyncNoop ${saveEventName} event is triggered without content changes`, () => {
    const activePaneId = store.get(activePaneAtom).id;
    store.set(closeEditorFromPaneAtom, { editorId: editorData.id, paneId: activePaneId });
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger(saveEventName);
    });

    expect(asyncNoop).toHaveBeenCalledTimes(1);
  });
});
