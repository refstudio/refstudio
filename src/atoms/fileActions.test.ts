import { act, renderHook } from '@testing-library/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { describe, expect, test } from 'vitest';

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

describe('fileActions', () => {
  test('should open TXT file in the left pane, and be active', () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    const numFilesBefore = leftPane.current.files.length;
    const fileToOpen = makeFile('openTXT.txt');

    act(() => openFile.current(fileToOpen));

    expect(leftPane.current.id).toBe('LEFT' as PaneId);
    expect(leftPane.current.files.length).toBe(numFilesBefore + 1);
    expect(leftPane.current.files).toContainEqual(fileToOpen);
    expect(leftPane.current.activeFile).toEqual(fileToOpen);
  });

  test('should open PDF file in the right pane, and be active', () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom));

    const numFilesBefore = rightPane.current.files.length;
    const fileToOpen = makeFile('openPDF.pdf');

    act(() => openFile.current(fileToOpen));

    expect(rightPane.current.id).toBe('RIGHT' as PaneId);
    expect(rightPane.current.files.length).toBe(numFilesBefore + 1);
    expect(rightPane.current.files).toContainEqual(fileToOpen);
    expect(rightPane.current.activeFile).toEqual(fileToOpen);
  });

  test('should not open file twice in same panel', () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    const numFilesBefore = leftPane.current.files.length;
    const fileToOpen = makeFile('openTwice.txt');
    act(() => {
      openFile.current(fileToOpen);
      openFile.current(fileToOpen);
      openFile.current(fileToOpen);
    });

    expect(leftPane.current.files.length).toBe(numFilesBefore + 1);
  });

  test('should close opened file in LEFT pane', () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    const numFilesOpened = leftPane.current.files.length;

    const fileA = makeFile('closeOpenedA.txt');
    const fileB = makeFile('closeOpenedB.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });
    expect(leftPane.current.files.length).toBe(numFilesOpened + 2);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, fileId: fileA.path });
    });

    expect(leftPane.current.files.length).toBe(numFilesOpened + 1);
  });

  test("should close file that isn't opened in pane", () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    const fileA = makeFile('closeNotOpenedA.txt');
    const fileB = makeFile('closeNotOpenedB.txt');
    const fileC = makeFile('closeNotOpenedC.txt');

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: closeAllFiles } = renderHook(() => useSetAtom(closeAllFilesAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom));

    const fileA = makeFile('closeAllFilesAtom.txt');
    const fileB = makeFile('closeAllFilesAtom.pdf');

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom));
    const { result: splitFileToPane } = renderHook(() => useSetAtom(splitFileToPaneAtom));

    const fileA = makeFile('splitFileToPane.txt');

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    const fileA = makeFile('fileActiveA1.txt');
    const fileB = makeFile('fileActiveB1.txt');
    const fileC = makeFile('fileActiveC1.txt');

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
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    const fileA = makeFile('fileActiveA2.txt');
    const fileB = makeFile('fileActiveB2.txt');
    const fileC = makeFile('fileActiveC2.txt');

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
    const { result: openFileResult } = renderHook(() => useSetAtom(openFileAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom));

    const sizeBeforeOpenFolder = leftPane.current.files.length + rightPane.current.files.length;

    act(() => openFileResult.current(makeFolder('uploads')));

    const sizeAfterOpenFolder = leftPane.current.files.length + rightPane.current.files.length;
    expect(sizeBeforeOpenFolder).toBe(sizeAfterOpenFolder);
  });

  test('should focus panel to make active', () => {
    const { result: activePane } = renderHook(() => useAtomValue(activePaneAtom));
    const { result: focusPanel } = renderHook(() => useSetAtom(focusPaneAtom));

    const paneToFocus: PaneId = activePane.current.id === 'LEFT' ? 'RIGHT' : 'LEFT';

    act(() => {
      focusPanel.current(paneToFocus);
    });

    expect(activePane.current.id).toBe(paneToFocus);
  });
});

function makeFile(name: string, extension?: string): FileFileEntry {
  name = extension ? name + '.' + extension : name;
  return {
    name,
    path: './' + name,
    fileExtension: extension ?? name.split('.').pop() ?? '',
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
