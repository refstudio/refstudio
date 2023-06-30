import { createStore } from 'jotai';

import { activePaneAtom, closeEditorFromPaneAtom, openFileEntryAtom } from '../../atoms/editorActions';
import { activePaneContentAtom } from '../../atoms/paneActions';
import { makeFile } from '../../atoms/test-fixtures';
import { runSetAtomHook } from '../../atoms/test-utils';
import { EditorData } from '../../atoms/types/EditorData';
import { FileEntry } from '../../atoms/types/FileEntry';
import { RefStudioEvents } from '../../events';
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

  it('should render children', () => {
    setupWithJotaiProvider(<EventsListener>Child</EventsListener>, store);

    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it(`should listen to ${RefStudioEvents.menu.file.save} events`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    expect(mockData.registeredEventName).toBe(RefStudioEvents.menu.file.save);
  });

  it(`should call saveFile when ${RefStudioEvents.menu.file.save} event is triggered`, () => {
    const mockData = mockListenEvent();
    const activePaneContent = store.get(activePaneContentAtom);
    const { updateEditorContentBufferAtom } = activePaneContent.activeEditor!.contentAtoms;

    const updateFileBuffer = runSetAtomHook(updateEditorContentBufferAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    const updatedContent = 'Updated content';

    act(() => {
      updateFileBuffer.current({ type: 'text', textContent: updatedContent });
      mockData.trigger();
    });

    expect(writeFileContent).toHaveBeenCalledTimes(1);
    expect(writeFileContent).toHaveBeenCalledWith(fileEntry.path, updatedContent);
  });

  it(`should not call saveFile when ${RefStudioEvents.menu.file.save} event is triggered without content changes`, () => {
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger();
    });

    expect(writeFileContent).toHaveBeenCalledTimes(0);
  });

  it(`should call asyncNoop ${RefStudioEvents.menu.file.save} event is triggered without content changes`, () => {
    const activePaneId = store.get(activePaneAtom).id;
    store.set(closeEditorFromPaneAtom, { editorId: editorData.id, paneId: activePaneId });
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger();
    });

    expect(asyncNoop).toHaveBeenCalledTimes(1);
  });
});
