import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, useAtomValue } from 'jotai';
import { describe, expect, test } from 'vitest';

import { readFileContent } from '../filesystem';
import {
  activePaneAtom,
  closeAllFilesAtom,
  closeFileFromPaneAtom,
  focusPaneAtom,
  leftPaneAtom,
  openFileAtom,
  rightPaneAtom,
  selectFileInPaneAtom,
  splitFileToPaneAtom,
} from './fileActions';
import { runGetAtomHook, runSetAtomHook } from './test-utils';
import { FileData } from './types/FileData';
import { FileFileEntry, FolderFileEntry } from './types/FileEntry';
import { PaneId } from './types/PaneGroup';

describe('fileActions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should be empty by default', () => {
    const store = createStore();
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    expect(leftPane.current.files.length).toBe(0);
    expect(leftPane.current.activeFile).toBeUndefined();
    expect(rightPane.current.files.length).toBe(0);
    expect(rightPane.current.activeFile).toBeUndefined();
  });

  test('should open TXT file in the left pane, and be active', () => {
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

  test('should open PDF file in the right pane, and be active', () => {
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

  test('should open file once in same panel', () => {
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

  test('should close opened file in same pane', () => {
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

  test('should not fail trying to close file that is not opened in pane', () => {
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

  test('should not fail trying to select file that is not opened in pane', () => {
    const store = createStore();
    const selectFileInPane = runSetAtomHook(selectFileInPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA, fileData: fileData } = makeFile('fileA.txt');

    act(() => {
      selectFileInPane.current({ paneId: leftPane.current.id, fileId: fileA.path });
    });

    expect(leftPane.current.files).not.toContainEqual(fileData);
  });

  test('should close all opened files with closeAllFilesAtom', () => {
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

  test('should split (move) file from one tab to the other', () => {
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

  test('should split (move) file from one tab to same tab', () => {
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

  test('should NOT split (move) file if file is NOT opened', () => {
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

  test('should make another file active, in same pane, after closing the active', () => {
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

  test('should not make another file active, in same pane, after closing other than the active', () => {
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

  test('should not open folder entries', () => {
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

  test('should focus panel to make active', () => {
    const store = createStore();
    const activePane = runGetAtomHook(activePaneAtom, store);
    const focusPanel = runSetAtomHook(focusPaneAtom, store);

    const paneToFocus: PaneId = activePane.current.id === 'LEFT' ? 'RIGHT' : 'LEFT';

    act(() => {
      focusPanel.current(paneToFocus);
    });

    expect(activePane.current.id).toBe(paneToFocus);
  });

  test('should read file content on openFile', async () => {
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

    expect(leftPane.current.activeFileContent).toBeDefined();
    const { result: activeFile } = renderHook(() => useAtomValue(leftPane.current.activeFileContent!, { store }));

    expect(activeFile.current.state).toBe('loading');

    await waitFor(() => {
      expect(mockedReadFileContent.mock.calls).toHaveLength(1);
    });

    if (activeFile.current.state !== 'hasData') {
      fail('Data should be available');
    }
    expect(activeFile.current.data).toEqual({ type: 'tiptap', textContent: 'some content' });
  });
});

function makeFile(name: string): { fileEntry: FileFileEntry; fileData: FileData } {
  const filePath = './' + name;
  return {
    fileEntry: {
      name,
      path: filePath,
      fileExtension: name.split('.').pop() ?? '',
      isFolder: false,
      isDotfile: false,
      isFile: true,
    },
    fileData: {
      fileId: filePath,
      fileName: name,
    },
  };
}
function makeFolder(name: string): FolderFileEntry {
  return {
    name,
    path: './' + name,
    isFolder: true,
    isDotfile: false,
    isFile: false,
    children: [],
  };
}
