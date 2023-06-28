import { createStore } from 'jotai';

import { activePaneContentAtom, openFileAtom } from './atoms/fileActions';
import { makeFile } from './atoms/test-fixtures';
import { runGetAtomHook, runSetAtomHook } from './atoms/test-utils';
import { FileEntry } from './atoms/types/FileEntry';
import { RefStudioEvents } from './events';
import { EventsListener } from './EventsListener';
import { readFileContent, writeFileContent } from './filesystem';
import { act, mockListenEvent, screen, setupWithJotaiProvider } from './utils/test-utils';

vi.mock('./events');
vi.mock('./filesystem');

describe('EventsListener', () => {
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
    const fileContentAtoms = runGetAtomHook(activePaneContentAtom, store);
    const { updateFileBufferAtom } = fileContentAtoms.current.activeFileAtoms!;

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
});
