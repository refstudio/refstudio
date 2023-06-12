import { act, renderHook } from '@testing-library/react';
import { createStore, useAtomValue, useSetAtom } from 'jotai';
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
  splitFileToPaneAtom,
} from './fileActions';
import { FileFileEntry, FolderFileEntry } from './types/FileEntry';
import { PaneId } from './types/PaneGroup';

vi.mock('../filesystem');

describe('fileActions', () => {
  test('should be empty by default', () => {
    const store = createStore();
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom, { store }));

    expect(leftPane.current.files.length).toBe(0);
    expect(leftPane.current.activeFile).toBeUndefined();
    expect(rightPane.current.files.length).toBe(0);
    expect(rightPane.current.activeFile).toBeUndefined();
  });

  test('should open TXT file in the left pane, and be active', () => {
    const store = createStore();
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom, { store }));

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));

    const fileToOpen = makeFile('file.txt');
    expect(leftPane.current.files.length).toBe(0);

    act(() => {
      openFile.current(fileToOpen);
      openFile.current(fileToOpen);
      openFile.current(fileToOpen);
    });

    expect(leftPane.current.files.length).toBe(1);
  });

  test('should close opened file in same pane', () => {
    const store = createStore();
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));

    const fileA = makeFile('fileA.txt');
    const fileB = makeFile('fileB.txt');
    const fileC = makeFile('fileC.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    expect(leftPane.current.files).toContainEqual(fileA);
    expect(leftPane.current.files).toContainEqual(fileB);
    expect(leftPane.current.files).not.toContainEqual(fileC);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileC.path });
    });

    expect(leftPane.current.files).toContainEqual(fileA);
    expect(leftPane.current.files).toContainEqual(fileB);
    expect(leftPane.current.files).not.toContainEqual(fileC);
  });

  test('should close all opened files with closeAllFilesAtom', () => {
    const store = createStore();
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: closeAllFiles } = renderHook(() => useSetAtom(closeAllFilesAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom, { store }));

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom, { store }));
    const { result: splitFileToPane } = renderHook(() => useSetAtom(splitFileToPaneAtom, { store }));

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

  test('should make another file active, in same pane, after closing the active', () => {
    const store = createStore();
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));

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

    expect(leftPane.current.activeFile).not.toEqual(fileC);
    expect(leftPane.current.activeFile).toEqual(fileB);
  });

  test('should not make another file active, in same pane, after closing other than the active', () => {
    const store = createStore();
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));

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
    const { result: openFileResult } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom, { store }));

    expect(leftPane.current.files.length).toBe(0);
    expect(rightPane.current.files.length).toBe(0);

    act(() => openFileResult.current(makeFolder('uploads')));

    expect(leftPane.current.files.length).toBe(0);
    expect(rightPane.current.files.length).toBe(0);
  });

  test('should focus panel to make active', () => {
    const store = createStore();
    const { result: activePane } = renderHook(() => useAtomValue(activePaneAtom, { store }));
    const { result: focusPanel } = renderHook(() => useSetAtom(focusPaneAtom, { store }));

    const paneToFocus: PaneId = activePane.current.id === 'LEFT' ? 'RIGHT' : 'LEFT';

    act(() => {
      focusPanel.current(paneToFocus);
    });

    expect(activePane.current.id).toBe(paneToFocus);
  });

  test('should read file content on openFile', async () => {
    const store = createStore();
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom, { store }));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom, { store }));

    const mockedReadFileContent = vi.mocked(readFileContent).mockResolvedValue({
      type: 'tiptap',
      textContent: 'some content',
    });

    const fileA = makeFile('fileA.txt');

    act(() => {
      openFile.current(fileA);
    });

    const { activeFileContent } = leftPane.current;
    expect(activeFileContent).toBeDefined();
    const { result: activeFile } = renderHook(() => useAtomValue(activeFileContent!, { store }));

    expect(activeFile.current.state).toBe('loading');

    await act(async () =>
      // Allow the jotai store to load the file
      // This is better than: `new Promise((resolve) => setTimeout(resolve, 1));`
      Promise.resolve(),
    );
    expect(mockedReadFileContent.mock.calls).toHaveLength(1);

    if (activeFile.current.state === 'hasData') {
      expect(activeFile.current.data).toEqual({ type: 'tiptap', textContent: 'some content' });
    } else {
      fail('Data should be available');
    }
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
