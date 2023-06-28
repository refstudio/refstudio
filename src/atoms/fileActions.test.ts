import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, useAtomValue } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';
import { describe, expect, it } from 'vitest';

import { readFileContent, writeFileContent } from '../filesystem';
import { ReferenceItem } from '../types/ReferenceItem';
import { asyncNoop } from '../utils/noop';
import {
  activePaneAtom,
  activePaneContentAtom,
  closeAllFilesAtom,
  closeFileFromPaneAtom,
  focusPaneAtom,
  leftPaneAtom,
  openFileAtom,
  openReferenceAtom,
  rightPaneAtom,
  selectFileInPaneAtom,
  splitFileToPaneAtom,
} from './fileActions';
import { setReferencesAtom } from './referencesState';
import { makeFile, makeFolder } from './test-fixtures';
import { runGetAtomHook, runSetAtomHook } from './test-utils';
import { FileContent } from './types/FileContent';
import { FileContentAtoms } from './types/FileContentAtoms';
import { FileEntry } from './types/FileEntry';
import { PaneId } from './types/PaneGroup';

describe('fileActions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be empty by default', () => {
    const store = createStore();
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    expect(leftPane.current.files.length).toBe(0);
    expect(leftPane.current.activeFile).toBeUndefined();
    expect(rightPane.current.files.length).toBe(0);
    expect(rightPane.current.activeFile).toBeUndefined();
  });

  it('should open TXT file in the left pane, and be active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileToOpen, fileData } = makeFile('file.txt');
    expect(leftPane.current.files).not.toContainEqual(fileData);
    expect(leftPane.current.activeFile).toBeUndefined();

    act(() => openFile.current(fileToOpen));

    expect(leftPane.current.id).toBe('LEFT' as PaneId);
    expect(leftPane.current.files.length).toBe(1);
    expect(leftPane.current.files).toContainEqual(fileData);
    expect(leftPane.current.activeFile).toEqual(fileData.fileId);
  });

  it('should open PDF file in the right pane, and be active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const { fileEntry: fileToOpen, fileData } = makeFile('file.pdf');
    expect(rightPane.current.files).not.toContainEqual(fileToOpen);
    expect(rightPane.current.activeFile).toBeUndefined();

    act(() => openFile.current(fileToOpen));

    expect(rightPane.current.id).toBe('RIGHT' as PaneId);
    expect(rightPane.current.files.length).toBe(1);
    expect(rightPane.current.files).toContainEqual(fileData);
    expect(rightPane.current.activeFile).toEqual(fileData.fileId);
  });

  it('should open file once in same panel', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileToOpen } = makeFile('file.txt');
    expect(leftPane.current.files.length).toBe(0);

    act(() => {
      openFile.current(fileToOpen);
      openFile.current(fileToOpen);
    });

    expect(leftPane.current.files.length).toBe(1);
  });

  it('should open Reference in the right pane, and make it active', () => {
    const store = createStore();
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const openReference = runSetAtomHook(openReferenceAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const reference: ReferenceItem = {
      id: 'reference',
      filename: 'reference.pdf',
      citationKey: 'citationKey',
      title: 'Reference',
      authors: [],
    };
    const referenceFileId = `refstudio://references/${reference.id}`;

    expect(rightPane.current.files.map(({ fileId }) => fileId)).not.toContainEqual(referenceFileId);
    expect(rightPane.current.activeFile).toBeUndefined();

    act(() => {
      setReferences.current([reference]);
      openReference.current(reference.id);
    });

    expect(rightPane.current.id).toBe<PaneId>('RIGHT');
    expect(rightPane.current.files.length).toBe(1);
    expect(rightPane.current.files.map(({ fileId }) => fileId)).toContainEqual(referenceFileId);
    expect(rightPane.current.activeFile).toEqual(referenceFileId);
  });

  it('should close opened file in same pane', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeFileFromPane = runSetAtomHook(closeFileFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA } = makeFile('fileA.txt');
    const { fileEntry: fileB } = makeFile('fileB.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });
    expect(leftPane.current.files.length).toBe(2);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileA.path });
    });

    expect(leftPane.current.files.length).toBe(1);
  });

  it('should not fail trying to close file that is not opened in pane', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeFileFromPane = runSetAtomHook(closeFileFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileOpened, fileData: openedFileData } = makeFile('fileA.txt');
    const { fileEntry: fileNotOpened, fileData: notOpenedFileData } = makeFile('fileB.txt');

    act(() => {
      openFile.current(fileOpened);
    });

    expect(leftPane.current.files).toContainEqual(openedFileData);
    expect(leftPane.current.files).not.toContainEqual(notOpenedFileData);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileNotOpened.path });
    });

    expect(leftPane.current.files).toContainEqual(openedFileData);
    expect(leftPane.current.files).not.toContainEqual(notOpenedFileData);
  });

  it('should not fail trying to select file that is not opened in pane', () => {
    const store = createStore();
    const selectFileInPane = runSetAtomHook(selectFileInPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA, fileData: fileData } = makeFile('fileA.txt');

    act(() => {
      selectFileInPane.current({ paneId: leftPane.current.id, fileId: fileA.path });
    });

    expect(leftPane.current.files).not.toContainEqual(fileData);
  });

  it('should not fail when trying to open a reference that does not exist', () => {
    const store = createStore();
    const openReference = runSetAtomHook(openReferenceAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const reference: ReferenceItem = {
      id: 'reference',
      filename: 'reference.pdf',
      citationKey: 'citationKey',
      title: 'Reference',
      authors: [],
    };
    const referenceFileId = `refstudio://references/${reference.id}`;

    expect(rightPane.current.files.map(({ fileId }) => fileId)).not.toContainEqual(referenceFileId);
    expect(rightPane.current.activeFile).toBeUndefined();

    act(() => {
      openReference.current(reference.id);
    });

    expect(rightPane.current.files.map(({ fileId }) => fileId)).not.toContainEqual(referenceFileId);
    expect(rightPane.current.activeFile).toBeUndefined();
  });

  it('should close all opened files with closeAllFilesAtom', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeAllFiles = runSetAtomHook(closeAllFilesAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const { fileEntry: fileA, fileData: fileAData } = makeFile('file.txt');
    const { fileEntry: fileB, fileData: fileBData } = makeFile('file.pdf');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    const paneFiles = [...leftPane.current.files, ...rightPane.current.files];
    expect(paneFiles).toContainEqual(fileAData);
    expect(paneFiles).toContainEqual(fileBData);

    act(() => closeAllFiles.current());

    const totalOpenedFiles = leftPane.current.files.length + rightPane.current.files.length;
    expect(totalOpenedFiles).toBe(0);
  });

  it('should split (move) file from one tab to the other', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const splitFileToPane = runSetAtomHook(splitFileToPaneAtom, store);

    const { fileEntry: fileA, fileData } = makeFile('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.files).toContainEqual(fileData);
    expect(rightPane.current.files).not.toContainEqual(fileData);

    act(() => {
      splitFileToPane.current({ fileId: fileA.path, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
    });

    expect(leftPane.current.files).not.toContainEqual(fileData);
    expect(rightPane.current.files).toContainEqual(fileData);
  });

  it('should split (move) file from one tab to same tab', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const splitFileToPane = runSetAtomHook(splitFileToPaneAtom, store);

    const { fileEntry: fileA, fileData } = makeFile('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.files).toContainEqual(fileData);
    expect(rightPane.current.files).not.toContainEqual(fileData);

    act(() => {
      splitFileToPane.current({ fileId: fileA.path, fromPaneId: 'LEFT', toPaneId: 'LEFT' });
    });

    expect(leftPane.current.files).toContainEqual(fileData);
    expect(rightPane.current.files).not.toContainEqual(fileData);
  });

  it('should make remaining file active when splitting (moving) file from one pane to another', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const activePane = runGetAtomHook(activePaneAtom, store);
    const splitFileToPane = runSetAtomHook(splitFileToPaneAtom, store);

    const { fileEntry: fileA, fileData: fileAData } = makeFile('file1.txt');
    const { fileEntry: fileB, fileData: fileBData } = makeFile('file2.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    expect(activePane.current.id).toBe('LEFT');
    expect(leftPane.current.activeFile).toBe(fileBData.fileId);

    act(() => {
      splitFileToPane.current({ fileId: fileBData.fileId, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
    });

    expect(activePane.current.id).toBe('RIGHT');

    expect(leftPane.current.files).toContainEqual(fileAData);
    expect(leftPane.current.activeFile).toBe(fileAData.fileId);
    expect(rightPane.current.files).toContainEqual(fileBData);
    expect(rightPane.current.activeFile).toBe(fileBData.fileId);
  });

  it('should NOT split (move) file if file is NOT opened', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const splitFileToPane = runSetAtomHook(splitFileToPaneAtom, store);

    const { fileEntry: fileA, fileData } = makeFile('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.files).toContainEqual(fileData);
    expect(rightPane.current.files).not.toContainEqual(fileData);

    act(() => {
      splitFileToPane.current({ fileId: fileA.path, fromPaneId: 'RIGHT', toPaneId: 'LEFT' });
    });

    expect(leftPane.current.files).toContainEqual(fileData);
    expect(rightPane.current.files).not.toContainEqual(fileData);
  });

  it('should make another file active, in same pane, after closing the active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeFileFromPane = runSetAtomHook(closeFileFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA } = makeFile('fileA.txt');
    const { fileEntry: fileB, fileData: fileBData } = makeFile('fileB.txt');
    const { fileEntry: fileC, fileData: fileCData } = makeFile('fileC.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPane.current.activeFile).toEqual(fileCData.fileId);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileC.path });
    });

    expect(leftPane.current.activeFile).toEqual(fileBData.fileId);
  });

  it('should not make another file active, in same pane, after closing other than the active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeFileFromPane = runSetAtomHook(closeFileFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA } = makeFile('fileA.txt');
    const { fileEntry: fileB } = makeFile('fileB.txt');
    const { fileEntry: fileC, fileData: fileCData } = makeFile('fileC.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPane.current.activeFile).toEqual(fileCData.fileId);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileB.path });
    });

    expect(leftPane.current.activeFile).toEqual(fileCData.fileId);
  });

  it('should make active file undefined if it is the last one closed in the pane', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeFileFromPane = runSetAtomHook(closeFileFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA } = makeFile('fileA.txt');
    const { fileEntry: fileB, fileData: fileBData } = makeFile('fileB.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    expect(leftPane.current.activeFile).toEqual(fileBData.fileId);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileB.path });
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileA.path });
    });

    expect(leftPane.current.activeFile).toBeUndefined();
  });

  it('should not open folder entries', () => {
    const store = createStore();
    const openFileResult = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    expect(leftPane.current.files.length).toBe(0);
    expect(rightPane.current.files.length).toBe(0);

    act(() => openFileResult.current(makeFolder('uploads')));

    expect(leftPane.current.files.length).toBe(0);
    expect(rightPane.current.files.length).toBe(0);
  });

  it('should focus panel to make active', () => {
    const store = createStore();
    const activePane = runGetAtomHook(activePaneAtom, store);
    const focusPanel = runSetAtomHook(focusPaneAtom, store);

    const paneToFocus: PaneId = activePane.current.id === 'LEFT' ? 'RIGHT' : 'LEFT';

    act(() => {
      focusPanel.current(paneToFocus);
    });

    expect(activePane.current.id).toBe(paneToFocus);
  });

  it('should read file content on openFile', async () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    vi.mock('../filesystem');
    const mockedReadFileContent = vi.mocked(readFileContent).mockResolvedValue({
      type: 'tiptap',
      textContent: 'some content',
    });

    const { fileEntry: fileA } = makeFile('fileA.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.activeFileAtoms).toBeDefined();
    const { result: activeFile } = renderHook(() =>
      useAtomValue(leftPane.current.activeFileAtoms!.loadableFileAtom, { store }),
    );

    expect(activeFile.current.state).toBe('loading');

    await waitFor(() => {
      expect(mockedReadFileContent.mock.calls).toHaveLength(1);
    });

    if (activeFile.current.state !== 'hasData') {
      fail('Data should be available');
    }
    expect(activeFile.current.data).toEqual({ type: 'tiptap', textContent: 'some content' });
  });

  it('should return the content of the active pane', () => {
    const store = createStore();
    const activePane = runGetAtomHook(activePaneContentAtom, store);
    const focusPanel = runSetAtomHook(focusPaneAtom, store);

    const paneToFocus: PaneId = activePane.current.id === 'LEFT' ? 'RIGHT' : 'LEFT';

    act(() => {
      focusPanel.current(paneToFocus);
    });

    expect(activePane.current.id).toBe(paneToFocus);
  });

  describe('File content atoms', () => {
    let store: ReturnType<typeof createStore>;
    let fileEntry: FileEntry;
    let fileContentAtoms: FileContentAtoms;

    beforeEach(() => {
      fileEntry = makeFile('file.txt').fileEntry;

      vi.mocked(readFileContent).mockResolvedValue({ type: 'tiptap', textContent: 'File content' });

      store = createStore();
      store.set(openFileAtom, fileEntry);

      const pane = store.get(activePaneContentAtom);
      expect(pane.activeFileAtoms).toBeDefined();

      fileContentAtoms = pane.activeFileAtoms!;
    });

    it('should not update the file atom when using updateFileBufferAtom', async () => {
      const { loadableFileAtom, updateFileBufferAtom } = fileContentAtoms;

      const loadableFile = runGetAtomHook(loadableFileAtom, store);
      const updateFileBuffer = runSetAtomHook(updateFileBufferAtom, store);

      await waitFor(() => {
        expect(loadableFile.current.state).toBe('hasData');
      });

      const initialFileContent = { ...loadableFile.current };

      act(() => {
        updateFileBuffer.current({ type: 'tiptap', textContent: 'Updated content' });
      });

      expect(loadableFile.current).toStrictEqual(initialFileContent);
    });

    it('should update the file atom when using saveFileInMemoryAtom', async () => {
      const { loadableFileAtom, updateFileBufferAtom, saveFileInMemoryAtom } = fileContentAtoms;

      const loadableFile = runGetAtomHook(loadableFileAtom, store);
      const updateFileBuffer = runSetAtomHook(updateFileBufferAtom, store);
      const saveFileInMemory = runSetAtomHook(saveFileInMemoryAtom, store);

      await waitFor(() => {
        expect(loadableFile.current.state).toBe('hasData');
      });

      const updatedContent = 'Updated content';

      act(() => {
        updateFileBuffer.current({ type: 'tiptap', textContent: updatedContent });
        saveFileInMemory.current();
      });

      const expectedData: Loadable<FileContent> = {
        state: 'hasData',
        data: { type: 'tiptap', textContent: updatedContent },
      };

      expect(loadableFile.current).toStrictEqual(expectedData);
    });

    it('should call writeFileContent when using saveFileAtom', async () => {
      vi.mocked(writeFileContent).mockImplementation(asyncNoop);

      const { loadableFileAtom, updateFileBufferAtom, saveFileAtom } = fileContentAtoms;

      const loadableFile = runGetAtomHook(loadableFileAtom, store);
      const updateFileBuffer = runSetAtomHook(updateFileBufferAtom, store);
      const saveFile = runSetAtomHook(saveFileAtom, store);

      await waitFor(() => {
        expect(loadableFile.current.state).toBe('hasData');
      });

      await act(async () => {
        updateFileBuffer.current({ type: 'tiptap', textContent: 'Updated content' });
        await saveFile.current();
      });

      expect(writeFileContent).toHaveBeenCalledOnce();
    });

    it('should not call writeFileContent if the file buffer is empty', async () => {
      vi.mocked(writeFileContent).mockImplementation(asyncNoop);

      const { loadableFileAtom, saveFileAtom } = fileContentAtoms;

      const loadableFile = runGetAtomHook(loadableFileAtom, store);
      const saveFile = runSetAtomHook(saveFileAtom, store);

      await waitFor(() => {
        expect(loadableFile.current.state).toBe('hasData');
      });

      await act(async () => {
        await saveFile.current();
      });

      expect(writeFileContent).not.toHaveBeenCalledOnce();
    });

    it('should not call writeFileContent if the type is not supported', async () => {
      vi.mocked(writeFileContent).mockImplementation(asyncNoop);

      const { loadableFileAtom, updateFileBufferAtom, saveFileAtom } = fileContentAtoms;

      const loadableFile = runGetAtomHook(loadableFileAtom, store);
      const updateFileBuffer = runSetAtomHook(updateFileBufferAtom, store);
      const saveFile = runSetAtomHook(saveFileAtom, store);

      await waitFor(() => {
        expect(loadableFile.current.state).toBe('hasData');
      });

      await act(async () => {
        updateFileBuffer.current({ type: 'json', textContent: 'Updated content' });
        await saveFile.current();
      });

      expect(writeFileContent).not.toHaveBeenCalledOnce();
    });
  });
});
