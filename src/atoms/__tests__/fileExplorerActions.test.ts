import { createStore } from 'jotai';

import { readAllProjectFiles } from '../../io/filesystem';
import { act } from '../../test/test-utils';
import { fileExplorerAtom, getFileExplorerEntryFromPathAtom, refreshFileTreeAtom } from '../fileExplorerActions';
import { FileExplorerFolderEntry } from '../types/FileExplorerEntry';
import { makeFile, makeFolder } from './test-fixtures';
import { runSetAtomHook, stringifyFileExplorerState } from './test-utils';

vi.mock('../../io/filesystem');

describe('fileExplorerActions', () => {
  let store: ReturnType<typeof createStore>;

  const rootFile = makeFile('Root File.txt');
  const nestedFile = makeFile('Nested File.pdf', '');
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
      > Root folder
        Nested File.pdf
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
    act(() => toggleCollapsed.current(false));

    expect(stringifyFileExplorerState(fileExplorer, store)).toMatchInlineSnapshot(`
      "
      v Root folder
        Nested File.pdf
      Root File.txt
      "
    `);
  });

  it('should update file tree, but keep collapsed/uncollapsed states', async () => {
    const initialEntries = [
      makeFile('Root file 1.txt'),
      makeFile('Root file 2.txt'),
      makeFolder('Root folder 1', [makeFile('Nested File 1.pdf'), makeFolder('Nested folder')]),
      makeFolder('Root folder 2', [makeFile('Nested File 2.pdf')]),
      makeFolder('Root folder 3', [makeFile('Nested File 3.pdf')]),
    ];

    vi.mocked(readAllProjectFiles).mockResolvedValueOnce(initialEntries);

    const refreshFileTree = runSetAtomHook(refreshFileTreeAtom, store);

    await act(() => refreshFileTree.current());

    const fileExplorer = store.get(fileExplorerAtom);
    const [folder] = store.get(fileExplorer.childrenAtom) as [FileExplorerFolderEntry];

    expect(folder.isFolder).toBe(true);

    const setCollapsed = runSetAtomHook(folder.collapsedAtom, store);
    act(() => setCollapsed.current(false));
    expect(stringifyFileExplorerState(fileExplorer, store)).toMatchInlineSnapshot(`
      "
      v Root folder 1
        > Nested folder
        Nested File 1.pdf
      > Root folder 2
        Nested File 2.pdf
      > Root folder 3
        Nested File 3.pdf
      Root file 1.txt
      Root file 2.txt
      "
    `);

    const updatedEntries = [
      makeFile('Root file 1.txt'),
      makeFile('Root file 3.txt'),
      makeFolder('Root folder 1', [makeFile('Nested File 5.pdf'), makeFolder('Nested folder')]),
      makeFolder('Root folder 2', [makeFile('Nested File 2.pdf')]),
      makeFolder('Root folder 4', [makeFile('Nested File 4.pdf')]),
    ];

    vi.mocked(readAllProjectFiles).mockResolvedValueOnce(updatedEntries);
    await act(() => refreshFileTree.current());
    expect(stringifyFileExplorerState(fileExplorer, store)).toMatchInlineSnapshot(`
      "
      v Root folder 1
        > Nested folder
        Nested File 5.pdf
      > Root folder 2
        Nested File 2.pdf
      > Root folder 4
        Nested File 4.pdf
      Root file 1.txt
      Root file 3.txt
      "
    `);
  });

  it('should return the correct file entry', async () => {
    await store.set(refreshFileTreeAtom);

    const fileExplorerEntryAtom = getFileExplorerEntryFromPathAtom(`${rootFolder.path}/${nestedFile.name}`);
    const fileExplorerEntry = store.get(fileExplorerEntryAtom);

    expect(fileExplorerEntry).not.toBeNull();
    expect(fileExplorerEntry!.name).toBe(nestedFile.name);
  });

  it('should return null if the entry does not exist', async () => {
    await store.set(refreshFileTreeAtom);

    const fileExplorerEntryAtom = getFileExplorerEntryFromPathAtom(`${rootFolder.path}/fakeFile`);
    const fileExplorerEntry = store.get(fileExplorerEntryAtom);

    expect(fileExplorerEntry).toBeNull();
  });

  it('should return null if the path is not valid', async () => {
    await store.set(refreshFileTreeAtom);

    const fileExplorerEntryAtom = getFileExplorerEntryFromPathAtom(`${rootFile.path}/${nestedFile.name}`);
    const fileExplorerEntry = store.get(fileExplorerEntryAtom);

    expect(fileExplorerEntry).toBeNull();
  });
});
