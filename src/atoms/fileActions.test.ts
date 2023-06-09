import { act, renderHook } from '@testing-library/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { describe, expect, test } from 'vitest';

import { fileEntryAtom } from './core/fileEntry';
import { openFileAtom, rightPaneAtom } from './fileActions';
import { FileFileEntry } from './types/FileEntry';
import { PaneId } from './types/PaneGroup';

const pdfFile: FileFileEntry = {
  name: 'file.pdf',
  path: './file.pdf',
  fileExtension: 'pdf',
  isFolder: false,
  isDotfile: false,
  isFile: true,
};
describe('fileActions', () => {
  test('should open PDF file as fileEntry', () => {
    const { result } = renderHook(() => useSetAtom(openFileAtom));
    const setOpenFile = result.current;

    act(() => setOpenFile(pdfFile));

    const { result: fileEntryResult } = renderHook(() => useAtomValue(fileEntryAtom));

    expect(fileEntryResult.current.has(pdfFile.path)).toBe(true);
    const fileEntry = fileEntryResult.current.get(pdfFile.path);
    expect(fileEntry).toEqual({ ...pdfFile });
  });

  test('should open PDF file in the right pane', () => {
    const { result: setOpenFileResult } = renderHook(() => useSetAtom(openFileAtom));
    act(() => setOpenFileResult.current(pdfFile));

    const { result: rightPanelResult } = renderHook(() => useAtomValue(rightPaneAtom));
    expect(rightPanelResult.current.id).toBe(<PaneId>'RIGHT');
    expect(rightPanelResult.current.files.length).toBe(1);
    expect(rightPanelResult.current.files).toStrictEqual([pdfFile]);
  });
});
