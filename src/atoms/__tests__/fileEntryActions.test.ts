import { exists } from '@tauri-apps/api/fs';
import { createStore } from 'jotai';

import { deleteFile as deleteFileFromDisk, getBaseDir, readAllProjectFiles } from '../../io/filesystem';
import { act } from '../../test/test-utils';
import { activePaneAtom } from '../editorActions';
import { createFileAtom, deleteFileAtom, openFileEntryAtom } from '../fileEntryActions';
import { refreshFileTreeAtom } from '../fileExplorerActions';
import { activePaneContentAtom } from '../paneActions';
import { PaneId } from '../types/PaneGroup';
import { makeFile, makeFileAndEditor, makeFolder } from './test-fixtures';
import { runGetAtomHook, runSetAtomHook } from './test-utils';

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

  it('should delete the file', async () => {
    const fileEntry = makeFile('File 1.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValueOnce([fileEntry]);
    await store.set(refreshFileTreeAtom);

    const deleteFile = runSetAtomHook(deleteFileAtom, store);
    await act(async () => {
      await deleteFile.current(fileEntry.path);
    });

    expect(deleteFileFromDisk).toHaveBeenCalledTimes(1);
    expect(deleteFileFromDisk).toHaveBeenCalledWith(fileEntry.path);
  });

  it('should close any open editor corresponding to the deleted file', async () => {
    const { fileEntry, editorData } = makeFileAndEditor('File 1.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
    await store.set(refreshFileTreeAtom);
    store.set(openFileEntryAtom, fileEntry);

    const activePane = runGetAtomHook(activePaneAtom, store);

    expect(activePane.current.openEditorIds).toContain(editorData.id);

    vi.mocked(deleteFileFromDisk).mockResolvedValueOnce(true);

    const deleteFile = runSetAtomHook(deleteFileAtom, store);
    await act(async () => {
      await deleteFile.current(fileEntry.path);
    });

    expect(activePane.current.openEditorIds).not.toContain(editorData.id);
  });

  it('should throw an error if the file does not exist', async () => {
    const deleteFile = runSetAtomHook(deleteFileAtom, store);
    await expect(() => deleteFile.current('./fakePath/fakeFile')).rejects.toThrowError(/does not exist/);
  });

  it('should throw an error when trying to delete a folder', async () => {
    const folderEntry = makeFolder('Folder');
    vi.mocked(readAllProjectFiles).mockResolvedValueOnce([folderEntry]);
    await store.set(refreshFileTreeAtom);

    const deleteFile = runSetAtomHook(deleteFileAtom, store);
    await expect(() => deleteFile.current(folderEntry.path)).rejects.toThrowError(/Deleting folders is not supported/);
  });
});
