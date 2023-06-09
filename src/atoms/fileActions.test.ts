import { act, renderHook } from '@testing-library/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { describe, expect, test } from 'vitest';

import { fileEntryAtom } from './core/fileEntry';
import { paneGroupAtom } from './core/paneGroup';
import { closeFileFromPaneAtom, leftPaneAtom, openFileAtom, rightPaneAtom } from './fileActions';
import { FileFileEntry, FolderFileEntry } from './types/FileEntry';
import { PaneId } from './types/PaneGroup';

describe('fileActions', () => {
  // HACK: This seems a very fragile way to reset the file atoms (maybe we can have a reset atom)
  beforeEach(() => {
    const { result: fileEntry } = renderHook(() => useSetAtom(fileEntryAtom));
    const { result: paneGroup } = renderHook(() => useSetAtom(paneGroupAtom));
    act(() => {
      fileEntry.current(new Map());
      paneGroup.current({
        LEFT: {
          openFiles: [],
        },
        RIGHT: {
          openFiles: [],
        },
      });
    });
  });

  test('left pane ID should be LEFT and start empty', () => {
    const { result: pane } = renderHook(() => useAtomValue(leftPaneAtom));
    expect(pane.current.id).toBe(<PaneId>'LEFT');
    expect(pane.current.activeFile).toBeUndefined();
    expect(pane.current.files.length).toBe(0);
  });

  test('right pane ID should be RIGHT and start empty', () => {
    const { result: pane } = renderHook(() => useAtomValue(rightPaneAtom));
    expect(pane.current.id).toBe(<PaneId>'RIGHT');
    expect(pane.current.activeFile).toBeUndefined();
    expect(pane.current.files.length).toBe(0);
  });

  test('should open PDF file in the right pane, and be active', () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom));

    expect(rightPane.current.files.length).toBe(0);
    act(() => openFile.current(PDF_FILE));

    expect(rightPane.current.id).toBe(<PaneId>'RIGHT');
    expect(rightPane.current.files.length).toBe(1);
    expect(rightPane.current.files).toStrictEqual([PDF_FILE]);
    expect(rightPane.current.activeFile).toStrictEqual(PDF_FILE);
  });

  test('should open TXT file in the left pane', () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    expect(leftPane.current.files.length).toBe(0);
    act(() => openFile.current(TXT_FILE));

    expect(leftPane.current.id).toBe(<PaneId>'LEFT');
    expect(leftPane.current.files.length).toBe(1);
    expect(leftPane.current.files).toStrictEqual([TXT_FILE]);
    expect(leftPane.current.activeFile).toStrictEqual(TXT_FILE);
  });

  test('should close opened file in pane', () => {
    const { result: openFile } = renderHook(() => useSetAtom(openFileAtom));
    const { result: closeFileFromPane } = renderHook(() => useSetAtom(closeFileFromPaneAtom));
    const { result: rightPane } = renderHook(() => useAtomValue(rightPaneAtom));
    const { result: leftPane } = renderHook(() => useAtomValue(leftPaneAtom));

    expect(leftPane.current.files.length).toBe(0);
    expect(rightPane.current.files.length).toBe(0);
    act(() => {
      openFile.current(TXT_FILE);
      openFile.current(TXT_FILE2);
    });
    expect(leftPane.current.files.length).toBe(2);

    act(() => {
      closeFileFromPane.current({ paneId: 'LEFT', fileId: TXT_FILE.path });
    });
    expect(leftPane.current.files.length).toBe(1);
  });

  test('closing active file should make another active in the same pane', () => {});
  test('closing non-active file should keep the active file active', () => {});

  test('should not open folder entries', () => {
    const { result: openFileResult } = renderHook(() => useSetAtom(openFileAtom));
    const { result: fileEntryResult } = renderHook(() => useAtomValue(fileEntryAtom));

    expect(fileEntryResult.current.size).toBe(0);
    act(() => openFileResult.current(FOLDER));
    expect(fileEntryResult.current.size).toBe(0);
  });
});

const PDF_FILE: FileFileEntry = {
  name: 'file.pdf',
  path: './file.pdf',
  fileExtension: 'pdf',
  isFolder: false,
  isDotfile: false,
  isFile: true,
};

const TXT_FILE: FileFileEntry = {
  name: 'file.txt',
  path: './file.txt',
  fileExtension: 'txt',
  isFolder: false,
  isDotfile: false,
  isFile: true,
};

const TXT_FILE2: FileFileEntry = {
  name: 'file2.txt',
  path: './file2.txt',
  fileExtension: 'txt',
  isFolder: false,
  isDotfile: false,
  isFile: true,
};

const FOLDER: FolderFileEntry = {
  name: 'uploads',
  path: './uploads',
  isFolder: true,
  isDotfile: false,
  isFile: false,
  children: [],
};
