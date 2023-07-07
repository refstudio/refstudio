import { createStore } from 'jotai';

import {
  deleteFile as deleteFileFromDisk,
  readAllProjectFiles,
  readFileContent,
  renameFile as renameFileFromDisk,
  writeFileContent,
} from '../../io/filesystem';
import { act } from '../../test/test-utils';
import { activePaneAtom } from '../editorActions';
import { createFileAtom, deleteFileAtom, openFileEntryAtom, renameFileAtom } from '../fileEntryActions';
import { refreshFileTreeAtom } from '../fileExplorerActions';
import { activePaneContentAtom } from '../paneActions';
import { EditorContent } from '../types/EditorContent';
import { buildEditorId } from '../types/EditorData';
import { PaneId } from '../types/PaneGroup';
import { makeFile, makeFileAndEditor, makeFolder } from './test-fixtures';
import { runGetAtomHook, runSetAtomHook } from './test-utils';

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

  it('should throw an error when trying to delete a file that does not exist', async () => {
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

  it('should rename the file', async () => {
    const fileEntry = makeFile('File.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
    await store.set(refreshFileTreeAtom);

    vi.mocked(renameFileFromDisk).mockResolvedValueOnce({ success: true, newPath: '' });

    const newName = 'Updated File.txt';

    const renameFile = runSetAtomHook(renameFileAtom, store);
    await act(async () => {
      await renameFile.current({ filePath: fileEntry.path, newName });
    });

    expect(renameFileFromDisk).toHaveBeenCalledTimes(1);
    expect(renameFileFromDisk).toHaveBeenCalledWith(fileEntry.path, newName);
  });

  it('should update editor data when renaming file', async () => {
    const fileEntry = makeFile('File.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
    await store.set(refreshFileTreeAtom);

    store.set(openFileEntryAtom, fileEntry);

    const activePaneContent = runGetAtomHook(activePaneContentAtom, store);
    expect(activePaneContent.current.openEditors).toHaveLength(1);
    expect(activePaneContent.current.openEditors[0].id).toBe(buildEditorId('text', fileEntry.path));
    expect(activePaneContent.current.openEditors[0].title).toBe(fileEntry.name);

    const newName = 'Updated File.txt';
    const newPath = '/new/path/to/file.txt';
    vi.mocked(renameFileFromDisk).mockResolvedValueOnce({ success: true, newPath });

    const renameFile = runSetAtomHook(renameFileAtom, store);
    await act(async () => {
      await renameFile.current({ filePath: fileEntry.path, newName });
    });

    expect(activePaneContent.current.openEditors).toHaveLength(1);
    expect(activePaneContent.current.openEditors[0].id).toBe(buildEditorId('text', newPath));
    expect(activePaneContent.current.openEditors[0].title).toBe(newName);
  });

  it('should update editor content when renaming file', async () => {
    const fileEntry = makeFile('File.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
    await store.set(refreshFileTreeAtom);

    const textContent = '';
    const editorContent: EditorContent = { type: 'text', textContent };
    vi.mocked(readFileContent).mockResolvedValue(editorContent);

    store.set(openFileEntryAtom, fileEntry);

    const activePaneContent = runGetAtomHook(activePaneContentAtom, store);
    expect(activePaneContent.current.activeEditor).toBeDefined();
    expect(activePaneContent.current.activeEditor!.id).toBe(buildEditorId('text', fileEntry.path));
    const editorId = store.get(activePaneContent.current.activeEditor!.contentAtoms.editorIdAtom);
    expect(editorId).toBe(buildEditorId('text', fileEntry.path));
    await act(async () => {
      store.set(activePaneContent.current.activeEditor!.contentAtoms.updateEditorContentBufferAtom, editorContent);
      await store.set(activePaneContent.current.activeEditor!.contentAtoms.saveEditorContentAtom);
    });
    expect(writeFileContent).toHaveBeenCalledTimes(1);
    expect(writeFileContent).toHaveBeenCalledWith(fileEntry.path, textContent);

    vi.mocked(writeFileContent).mockClear();

    const newName = 'Updated File.txt';
    const newPath = '/new/path/to/file.txt';
    vi.mocked(renameFileFromDisk).mockResolvedValueOnce({ success: true, newPath });

    const renameFile = runSetAtomHook(renameFileAtom, store);
    await act(async () => {
      await renameFile.current({ filePath: fileEntry.path, newName });
    });

    expect(activePaneContent.current.activeEditor).toBeDefined();
    expect(activePaneContent.current.activeEditor!.id).toBe(buildEditorId('text', newPath));
    const newEditorId = store.get(activePaneContent.current.activeEditor!.contentAtoms.editorIdAtom);
    expect(newEditorId).toBe(buildEditorId('text', newPath));
    await act(async () => {
      store.set(activePaneContent.current.activeEditor!.contentAtoms.updateEditorContentBufferAtom, editorContent);
      await store.set(activePaneContent.current.activeEditor!.contentAtoms.saveEditorContentAtom);
    });
    expect(writeFileContent).toHaveBeenCalledTimes(1);
    expect(writeFileContent).toHaveBeenCalledWith(newPath, textContent);
  });

  it('should throw an error when trying to rename a file that does not exist', async () => {
    const renameFile = runSetAtomHook(renameFileAtom, store);
    await expect(() => renameFile.current({ filePath: './fakePath/fakeFile', newName: '' })).rejects.toThrowError(
      /does not exist/,
    );
  });

  it('should throw an error when trying to rename a folder', async () => {
    const folderEntry = makeFolder('Folder');
    vi.mocked(readAllProjectFiles).mockResolvedValueOnce([folderEntry]);
    await store.set(refreshFileTreeAtom);

    const renameFile = runSetAtomHook(renameFileAtom, store);
    await expect(() => renameFile.current({ filePath: folderEntry.path, newName: '' })).rejects.toThrowError(
      /Renaming folders is not supported/,
    );
  });

  it('should do nothing if renaming fails', async () => {
    const fileEntry = makeFile('File.txt');
    vi.mocked(readAllProjectFiles).mockResolvedValue([fileEntry]);
    await store.set(refreshFileTreeAtom);

    store.set(openFileEntryAtom, fileEntry);
    const activePaneContent = runGetAtomHook(activePaneContentAtom, store);

    vi.mocked(renameFileFromDisk).mockResolvedValueOnce({ success: false });

    const newName = 'Updated File.txt';

    const renameFile = runSetAtomHook(renameFileAtom, store);
    await act(async () => {
      await renameFile.current({ filePath: fileEntry.path, newName });
    });

    expect(activePaneContent.current.openEditors).toHaveLength(1);
    expect(activePaneContent.current.openEditors[0].id).toBe(buildEditorId('text', fileEntry.path));
    expect(activePaneContent.current.openEditors[0].title).toBe(fileEntry.name);

    expect(activePaneContent.current.activeEditor).toBeDefined();
    expect(activePaneContent.current.activeEditor!.id).toBe(buildEditorId('text', fileEntry.path));
  });
});
