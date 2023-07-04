import { createStore } from 'jotai';

import { readAllProjectFiles } from '../../io/filesystem';
import { act } from '../../test/test-utils';
import { fileExplorerAtom, refreshFileTreeAtom } from '../fileExplorerActions';
import { FileExplorerFolderEntry } from '../types/FileExplorerEntry';
import { makeFile, makeFolder } from './test-fixtures';
import { runSetAtomHook, stringifyFileExplorerState } from './test-utils';

vi.mock('../../io/filesystem');

describe('fileExplorerActions', () => {
  let store: ReturnType<typeof createStore>;

  const { fileEntry: rootFile } = makeFile('Root File.txt');
  const { fileEntry: nestedFile } = makeFile('Nested File.pdf');
  const rootFolder = makeFolder('Root folder', [nestedFile]);

  beforeEach(() => {
    store = createStore();
    vi.mocked(readAllProjectFiles).mockResolvedValue([rootFile, rootFolder]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have folders collapsed by default', async () => {
    const refreshFileTree = runSetAtomHook(refreshFileTreeAtom, store);

    await act(() => refreshFileTree.current());

    const fileExplorer = store.get(fileExplorerAtom);

    expect(stringifyFileExplorerState(fileExplorer, store)).toMatchInlineSnapshot(`
      "
      > Root folder (1)
      Root File.txt
      "
    `);
  });

  it('should uncollapse folder', async () => {
    const refreshFileTree = runSetAtomHook(refreshFileTreeAtom, store);

    await act(() => refreshFileTree.current());

    const fileExplorer = store.get(fileExplorerAtom);
    const [folder] = store.get(fileExplorer.childrenAtom) as [FileExplorerFolderEntry];

    expect(folder.isFolder).toBe(true);

    const toggleCollapsed = runSetAtomHook(folder.collapsedAtom, store);
    act(() => toggleCollapsed.current());

    expect(stringifyFileExplorerState(fileExplorer, store)).toMatchInlineSnapshot(`
      "
      v Root folder
        Nested File.pdf
      Root File.txt
      "
    `);
  });

  it('should update file tree, but keep collapsed/uncollapsed states', async () => {
    const { fileEntry: nestedFile1 } = makeFile('Nested File 1.pdf');
    const rootFolder1 = makeFolder('Root folder 1', [nestedFile1]);
    const { fileEntry: nestedFile2 } = makeFile('Nested File 2.pdf');
    const rootFolder2 = makeFolder('Root folder 2', [nestedFile2]);
    const { fileEntry: nestedFile3 } = makeFile('Nested File 3.pdf');
    const folderToBeDeleted = makeFolder('Root folder 3', [nestedFile3]);
    const { fileEntry: nestedFile4 } = makeFile('Nested File 4.pdf');
    const folderToBeCreated = makeFolder('Root folder 4', [nestedFile4]);

    vi.mocked(readAllProjectFiles).mockResolvedValueOnce([rootFolder1, rootFolder2, folderToBeDeleted, rootFile]);

    const refreshFileTree = runSetAtomHook(refreshFileTreeAtom, store);

    await act(() => refreshFileTree.current());

    const fileExplorer = store.get(fileExplorerAtom);
    const [folder] = store.get(fileExplorer.childrenAtom) as [FileExplorerFolderEntry];

    expect(folder.isFolder).toBe(true);

    const toggleCollapsed = runSetAtomHook(folder.collapsedAtom, store);
    act(() => toggleCollapsed.current());
    expect(stringifyFileExplorerState(fileExplorer, store)).toMatchInlineSnapshot(`
      "
      v Root folder 1
        Nested File 1.pdf
      > Root folder 2 (1)
      > Root folder 3 (1)
      Root File.txt
      "
    `);

    vi.mocked(readAllProjectFiles).mockResolvedValueOnce([rootFolder1, rootFolder2, folderToBeCreated, rootFile]);
    await act(() => refreshFileTree.current());
    expect(stringifyFileExplorerState(fileExplorer, store)).toMatchInlineSnapshot(`
      "
      v Root folder 1
        Nested File 1.pdf
      > Root folder 2 (1)
      > Root folder 4 (1)
      Root File.txt
      "
    `);
  });
});
