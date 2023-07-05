import { exists } from '@tauri-apps/api/fs';
import { createStore } from 'jotai';

import { getBaseDir } from '../../io/filesystem';
import { act } from '../../test/test-utils';
import { createFileAtom } from '../fileEntryActions';
import { activePaneContentAtom } from '../paneActions';
import { PaneId } from '../types/PaneGroup';
import { runSetAtomHook } from './test-utils';

vi.mock('../../io/filesystem');
vi.mock('@tauri-apps/api/fs');

describe('fileEntryActions', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.mocked(getBaseDir).mockResolvedValue('/baseDir');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a file and open it in the LEFT pane', async () => {
    vi.mocked(exists).mockResolvedValueOnce(false);
    const createFile = runSetAtomHook(createFileAtom, store);

    await act(() => createFile.current());

    const paneContent = store.get(activePaneContentAtom);
    expect(paneContent.id).toBe<PaneId>('LEFT');
    expect(paneContent.activeEditor).toBeDefined();
    expect(paneContent.activeEditor!.id).toMatchInlineSnapshot('"refstudio://text//baseDir/Untitled-1"');
  });

  it('should create a file with the first available name', async () => {
    vi.mocked(exists).mockImplementation((path) => Promise.resolve(path === '/baseDir/Untitled-1'));
    const createFile = runSetAtomHook(createFileAtom, store);

    await act(async () => {
      await createFile.current();
      await createFile.current();
    });

    const paneContent = store.get(activePaneContentAtom);
    expect(paneContent.id).toBe<PaneId>('LEFT');
    expect(paneContent.activeEditor).toBeDefined();
    expect(paneContent.activeEditor!.id).toMatchInlineSnapshot('"refstudio://text//baseDir/Untitled-3"');
  });
});
