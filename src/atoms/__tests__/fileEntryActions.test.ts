import { createStore } from 'jotai';

import { readAllProjectFiles } from '../../io/filesystem';
import { act } from '../../test/test-utils';
import { createFileAtom } from '../fileEntryActions';
import { refreshFileTreeAtom } from '../fileExplorerActions';
import { activePaneContentAtom } from '../paneActions';
import { PaneId } from '../types/PaneGroup';
import { makeFile } from './test-fixtures';
import { runSetAtomHook } from './test-utils';

vi.mock('../../io/filesystem');

describe('fileEntryActions', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a file and open it in the LEFT pane', () => {
    const createFile = runSetAtomHook(createFileAtom, store);

    act(() => createFile.current());

    const paneContent = store.get(activePaneContentAtom);
    expect(paneContent.id).toBe<PaneId>('LEFT');
    expect(paneContent.activeEditor).toBeDefined();
    expect(paneContent.activeEditor!.id).toMatchInlineSnapshot('"refstudio://text//Untitled-1"');
  });

  it('should create a file with the first available name', async () => {
    const createFile = runSetAtomHook(createFileAtom, store);
    vi.mocked(readAllProjectFiles).mockResolvedValueOnce([makeFile('Untitled-1')]);
    await store.set(refreshFileTreeAtom);

    act(() => {
      createFile.current();
      createFile.current();
    });

    const paneContent = store.get(activePaneContentAtom);
    expect(paneContent.id).toBe<PaneId>('LEFT');
    expect(paneContent.activeEditor).toBeDefined();
    expect(paneContent.activeEditor!.id).toMatchInlineSnapshot('"refstudio://text//Untitled-3"');
  });
});
