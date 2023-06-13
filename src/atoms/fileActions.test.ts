import { act, renderHook } from '@testing-library/react-hooks';
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

    const fileToOpen = makeFile('file.txt');
    expect(leftPane.current.files).not.toContainEqual(fileToOpen);
    expect(leftPane.current.activeFile).toBeUndefined();

    act(() => openFile.current(fileToOpen));

    expect(leftPane.current.id).toBe('LEFT' as PaneId);
    expect(leftPane.current.files.length).toBe(1);
    expect(leftPane.current.files).toContainEqual(fileToOpen);
    expect(leftPane.current.activeFile).toEqual(fileToOpen);
  });

  test('should open PDF file in the right pane, and be active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const fileToOpen = makeFile('file.pdf');
    expect(rightPane.current.files).not.toContainEqual(fileToOpen);
    expect(rightPane.current.activeFile).toBeUndefined();

    act(() => openFile.current(fileToOpen));

    expect(rightPane.current.id).toBe('RIGHT' as PaneId);
    expect(rightPane.current.files.length).toBe(1);
    expect(rightPane.current.files).toContainEqual(fileToOpen);
    expect(rightPane.current.activeFile).toEqual(fileToOpen);
  });

  test('should open file once in same panel', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const fileToOpen = makeFile('file.txt');
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

    const fileA = makeFile('fileA.txt');
    const fileB = makeFile('fileB.txt');

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

    const fileOpened = makeFile('fileA.txt');
    const fileNotOpened = makeFile('fileB.txt');

    act(() => {
      openFile.current(fileOpened);
    });

    expect(leftPane.current.files).toContainEqual(fileOpened);
    expect(leftPane.current.files).not.toContainEqual(fileNotOpened);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileNotOpened.path });
    });

    expect(leftPane.current.files).toContainEqual(fileOpened);
    expect(leftPane.current.files).not.toContainEqual(fileNotOpened);
  });

  test('should not fail trying to select file that is not opened in pane', () => {
    const store = createStore();
    const selectFileInPane = runSetAtomHook(selectFileInPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const fileA = makeFile('fileA.txt');

    act(() => {
      selectFileInPane.current({ paneId: leftPane.current.id, fileId: fileA.path });
    });

    expect(leftPane.current.files).not.toContainEqual(fileA);
  });

  test('should close all opened files with closeAllFilesAtom', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeAllFiles = runSetAtomHook(closeAllFilesAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const fileA = makeFile('file.txt');
    const fileB = makeFile('file.pdf');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    const paneFiles = [...leftPane.current.files, ...rightPane.current.files];
    expect(paneFiles).toContainEqual(fileA);
    expect(paneFiles).toContainEqual(fileB);

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

    const fileA = makeFile('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.files).toContainEqual(fileA);
    expect(rightPane.current.files).not.toContainEqual(fileA);

    act(() => {
      splitFileToPane.current({ fileId: fileA.path, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
    });

    expect(leftPane.current.files).not.toContainEqual(fileA);
    expect(rightPane.current.files).toContainEqual(fileA);
  });

  test('should split (move) file from one tab to same tab', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const splitFileToPane = runSetAtomHook(splitFileToPaneAtom, store);

    const fileA = makeFile('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.files).toContainEqual(fileA);
    expect(rightPane.current.files).not.toContainEqual(fileA);

    act(() => {
      splitFileToPane.current({ fileId: fileA.path, fromPaneId: 'LEFT', toPaneId: 'LEFT' });
    });

    expect(leftPane.current.files).toContainEqual(fileA);
    expect(rightPane.current.files).not.toContainEqual(fileA);
  });

  test('should NOT split (move) file if file is NOT opened', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const splitFileToPane = runSetAtomHook(splitFileToPaneAtom, store);

    const fileA = makeFile('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.files).toContainEqual(fileA);
    expect(rightPane.current.files).not.toContainEqual(fileA);

    act(() => {
      splitFileToPane.current({ fileId: fileA.path, fromPaneId: 'RIGHT', toPaneId: 'LEFT' });
    });

    expect(leftPane.current.files).toContainEqual(fileA);
    expect(rightPane.current.files).not.toContainEqual(fileA);
  });

  test('should make another file active, in same pane, after closing the active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeFileFromPane = runSetAtomHook(closeFileFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const fileA = makeFile('fileA.txt');
    const fileB = makeFile('fileB.txt');
    const fileC = makeFile('fileC.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPane.current.activeFile).toEqual(fileC);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileC.path });
    });

    expect(leftPane.current.activeFile).toEqual(fileB);
  });

  test('should not make another file active, in same pane, after closing other than the active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileAtom, store);
    const closeFileFromPane = runSetAtomHook(closeFileFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const fileA = makeFile('fileA.txt');
    const fileB = makeFile('fileB.txt');
    const fileC = makeFile('fileC.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPane.current.activeFile).toEqual(fileC);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileB.path });
    });

    expect(leftPane.current.activeFile).toEqual(fileC);
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

    const fileA = makeFile('fileA.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.activeFileContent).toBeDefined();
    const { result: activeFile, waitForNextUpdate } = renderHook(() =>
      useAtomValue(leftPane.current.activeFileContent!, { store }),
    );

    expect(activeFile.current.state).toBe('loading');

    await waitForNextUpdate();

    expect(mockedReadFileContent.mock.calls).toHaveLength(1);

    if (activeFile.current.state !== 'hasData') {
      fail('Data should be available');
    }
    expect(activeFile.current.data).toEqual({ type: 'tiptap', textContent: 'some content' });
  });
});

function makeFile(name: string): FileFileEntry {
  return {
    name,
    path: './' + name,
    fileExtension: name.split('.').pop() ?? '',
    isFolder: false,
    isDotfile: false,
    isFile: true,
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
