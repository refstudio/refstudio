import { createStore } from 'jotai';

import { activePaneAtom, activePaneContentAtom, closeFileFromPaneAtom, openFileAtom } from './atoms/fileActions';
import { makeFile } from './atoms/test-fixtures';
import { runSetAtomHook } from './atoms/test-utils';
import { FileEntry } from './atoms/types/FileEntry';
import { RefStudioEvents } from './events';
import { EventsListener } from './EventsListener';
import { readFileContent, writeFileContent } from './filesystem';
import { asyncNoop } from './utils/noop';
import { act, mockListenEvent, screen, setupWithJotaiProvider } from './utils/test-utils';

vi.mock('./events');
vi.mock('./filesystem');
vi.mock('./utils/noop');

describe('EventsListener.save', () => {
  let store: ReturnType<typeof createStore>;
  let fileEntry: FileEntry;

  beforeEach(() => {
    vi.mocked(readFileContent).mockResolvedValue({ type: 'tiptap', textContent: 'Lorem Ipsum' });
    store = createStore();

    fileEntry = makeFile('File.txt').fileEntry;

    store.set(openFileAtom, fileEntry);
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
    const fileContentAtoms = store.get(activePaneContentAtom);
    const { updateFileBufferAtom } = fileContentAtoms.activeFileAtoms!;

    const updateFileBuffer = runSetAtomHook(updateFileBufferAtom, store);

    setupWithJotaiProvider(<EventsListener />, store);

    const updatedContent = 'Updated content';

    act(() => {
      updateFileBuffer.current({ type: 'tiptap', textContent: updatedContent });
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
    store.set(closeFileFromPaneAtom, { fileId: fileEntry.path, paneId: activePaneId });
    const mockData = mockListenEvent();

    setupWithJotaiProvider(<EventsListener />, store);

    act(() => {
      mockData.trigger();
    });

    expect(asyncNoop).toHaveBeenCalledTimes(1);
  });
});
