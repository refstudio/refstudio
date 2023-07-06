import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, useAtomValue } from 'jotai';

import { readFileContent } from '../../io/filesystem';
import { ReferenceItem } from '../../types/ReferenceItem';
import {
  activePaneAtom,
  closeAllEditorsAtom,
  closeEditorFromAllPanesAtom,
  closeEditorFromPaneAtom,
  moveEditorToPaneAtom,
  openReferenceAtom,
  selectEditorInPaneAtom,
} from '../editorActions';
import { openFileEntryAtom, openFilePathAtom } from '../fileEntryActions';
import { leftPaneAtom, rightPaneAtom } from '../paneActions';
import { setReferencesAtom } from '../referencesState';
import { buildEditorId } from '../types/EditorData';
import { PaneId } from '../types/PaneGroup';
import { makeFileAndEditor, makeFolder } from './test-fixtures';
import { runGetAtomHook, runSetAtomHook } from './test-utils';

vi.mock('../../io/filesystem');

describe('editorActions', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be empty by default', () => {
    const store = createStore();
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    expect(leftPane.current.openEditors.length).toBe(0);
    expect(leftPane.current.activeEditor).toBeUndefined();
    expect(rightPane.current.openEditors.length).toBe(0);
    expect(rightPane.current.activeEditor).toBeUndefined();
  });

  it('should open TXT file in the left pane, and be active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileToOpen, editorData } = makeFileAndEditor('file.txt');
    expect(leftPane.current.openEditors).not.toContainEqual(editorData);
    expect(leftPane.current.activeEditor).toBeUndefined();

    act(() => openFile.current(fileToOpen));

    expect(leftPane.current.id).toBe('LEFT' as PaneId);
    expect(leftPane.current.openEditors.length).toBe(1);
    expect(leftPane.current.openEditors).toContainEqual(editorData);
    expect(leftPane.current.activeEditor!.id).toBe(editorData.id);
  });

  it('should open TXT filePath in the left pane, and be active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFilePathAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    expect(leftPane.current.activeEditor).toBeUndefined();

    const filePath = '/some/absolute/path/file.txt';
    act(() => openFile.current(filePath));

    expect(leftPane.current.id).toBe('LEFT' as PaneId);
    expect(leftPane.current.openEditors.length).toBe(1);

    const editorId = buildEditorId('text', filePath);
    expect(leftPane.current.activeEditor!.id).toBe(editorId);
  });

  it('should open PDF file in the right pane, and be active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const { fileEntry: fileToOpen, editorData } = makeFileAndEditor('file.pdf');
    expect(rightPane.current.openEditors).not.toContainEqual(fileToOpen);
    expect(rightPane.current.activeEditor).toBeUndefined();

    act(() => openFile.current(fileToOpen));

    expect(rightPane.current.id).toBe('RIGHT' as PaneId);
    expect(rightPane.current.openEditors.length).toBe(1);
    expect(rightPane.current.openEditors).toContainEqual(editorData);
    expect(rightPane.current.activeEditor!.id).toBe(editorData.id);
  });

  it('should open file once in same panel', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileToOpen } = makeFileAndEditor('file.txt');
    expect(leftPane.current.openEditors.length).toBe(0);

    act(() => {
      openFile.current(fileToOpen);
      openFile.current(fileToOpen);
    });

    expect(leftPane.current.openEditors.length).toBe(1);
  });

  it('should open Reference in the right pane, and make it active', () => {
    const store = createStore();
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const openReference = runSetAtomHook(openReferenceAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const reference: ReferenceItem = {
      id: 'reference',
      filepath: '/path/to/reference.pdf',
      filename: 'reference.pdf',
      citationKey: 'citationKey',
      title: 'Reference',
      status: 'complete',
      authors: [],
    };
    const editorId = buildEditorId('reference', reference.id);

    expect(rightPane.current.openEditors.map(({ id }) => id)).not.toContain(editorId);
    expect(rightPane.current.activeEditor).toBeUndefined();

    act(() => {
      setReferences.current([reference]);
      openReference.current(reference.id);
    });

    expect(rightPane.current.id).toBe<PaneId>('RIGHT');
    expect(rightPane.current.openEditors.length).toBe(1);
    expect(rightPane.current.openEditors.map(({ id }) => id)).toContain(editorId);
    expect(rightPane.current.activeEditor!.id).toBe(editorId);
  });

  it('should close opened file in same pane', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA, editorData: editorDataA } = makeFileAndEditor('fileA.txt');
    const { fileEntry: fileB } = makeFileAndEditor('fileB.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });
    expect(leftPane.current.openEditors.length).toBe(2);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, editorId: editorDataA.id });
    });

    expect(leftPane.current.openEditors.length).toBe(1);
  });

  it('should close opened files from all panes', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeEditorFromAllPanes = runSetAtomHook(closeEditorFromAllPanesAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const { fileEntry: fileA, editorData: editorDataA } = makeFileAndEditor('fileA.txt');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.pdf');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });
    expect(leftPane.current.openEditors.length).toBe(1);
    expect(rightPane.current.openEditors.length).toBe(1);

    act(() => {
      closeEditorFromAllPanes.current(editorDataA.id);
      closeEditorFromAllPanes.current(editorDataB.id);
    });

    expect(leftPane.current.openEditors.length).toBe(0);
    expect(rightPane.current.openEditors.length).toBe(0);
  });

  it('should not fail trying to close file that is not opened in pane', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileOpened, editorData: openedEditorData } = makeFileAndEditor('fileA.txt');
    const { editorData: notOpenedEditorData } = makeFileAndEditor('fileB.txt');

    act(() => {
      openFile.current(fileOpened);
    });

    expect(leftPane.current.openEditors).toContainEqual(openedEditorData);
    expect(leftPane.current.openEditors).not.toContainEqual(notOpenedEditorData);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, editorId: notOpenedEditorData.id });
    });

    expect(leftPane.current.openEditors).toContainEqual(openedEditorData);
    expect(leftPane.current.openEditors).not.toContainEqual(notOpenedEditorData);
  });

  it('should not fail trying to select file that is not opened in pane', () => {
    const store = createStore();
    const selectFileInPane = runSetAtomHook(selectEditorInPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { editorData } = makeFileAndEditor('fileA.txt');

    act(() => {
      selectFileInPane.current({ paneId: leftPane.current.id, editorId: editorData.id });
    });

    expect(leftPane.current.openEditors).not.toContainEqual(editorData);
  });

  it('should not fail when trying to open a reference that does not exist', () => {
    const store = createStore();
    const openReference = runSetAtomHook(openReferenceAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const reference: ReferenceItem = {
      id: 'reference',
      filepath: '/path/to/reference.pdf',
      filename: 'reference.pdf',
      citationKey: 'citationKey',
      title: 'Reference',
      status: 'complete',
      authors: [],
    };
    const editorId = buildEditorId('reference', reference.id);

    expect(rightPane.current.openEditors.map(({ id }) => id)).not.toContainEqual(editorId);
    expect(rightPane.current.activeEditor).toBeUndefined();

    act(() => {
      openReference.current(reference.id);
    });

    expect(rightPane.current.openEditors.map(({ id }) => id)).not.toContainEqual(editorId);
    expect(rightPane.current.activeEditor).toBeUndefined();
  });

  it('should close all opened files with closeAllFilesAtom', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeAllFiles = runSetAtomHook(closeAllEditorsAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    const { fileEntry: fileA, editorData: fileAData } = makeFileAndEditor('file.txt');
    const { fileEntry: fileB, editorData: fileBData } = makeFileAndEditor('file.pdf');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    const paneFiles = [...leftPane.current.openEditors, ...rightPane.current.openEditors];
    expect(paneFiles).toContainEqual(fileAData);
    expect(paneFiles).toContainEqual(fileBData);

    act(() => closeAllFiles.current());

    const totalOpenedFiles = leftPane.current.openEditors.length + rightPane.current.openEditors.length;
    expect(totalOpenedFiles).toBe(0);
  });

  it('should move file from one tab to the other', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry, editorData } = makeFileAndEditor('file.txt');

    act(() => {
      openFile.current(fileEntry);
    });

    expect(leftPane.current.openEditors).toContainEqual(editorData);
    expect(rightPane.current.openEditors).not.toContainEqual(editorData);

    act(() => {
      moveEditorToPane.current({ editorId: editorData.id, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
    });

    expect(leftPane.current.openEditors).not.toContainEqual(editorData);
    expect(rightPane.current.openEditors).toContainEqual(editorData);
  });

  it('should move file from one tab to same tab', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry: fileA, editorData } = makeFileAndEditor('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.openEditors).toContainEqual(editorData);
    expect(rightPane.current.openEditors).not.toContainEqual(editorData);

    act(() => {
      moveEditorToPane.current({ editorId: editorData.id, fromPaneId: 'LEFT', toPaneId: 'LEFT' });
    });

    expect(leftPane.current.openEditors).toContainEqual(editorData);
    expect(rightPane.current.openEditors).not.toContainEqual(editorData);
  });

  it('should make remaining file active when moving file from one pane to another', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const activePane = runGetAtomHook(activePaneAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry: fileA, editorData: fileAData } = makeFileAndEditor('file1.txt');
    const { fileEntry: fileB, editorData: fileBData } = makeFileAndEditor('file2.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    expect(activePane.current.id).toBe('LEFT');
    expect(leftPane.current.activeEditor!.id).toBe(fileBData.id);

    act(() => {
      moveEditorToPane.current({ editorId: fileBData.id, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
    });

    expect(activePane.current.id).toBe('RIGHT');

    expect(leftPane.current.openEditors).toContainEqual(fileAData);
    expect(leftPane.current.activeEditor!.id).toBe(fileAData.id);
    expect(rightPane.current.openEditors).toContainEqual(fileBData);
    expect(rightPane.current.activeEditor!.id).toBe(fileBData.id);
  });

  it('should NOT move file if file is NOT opened', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry: fileA, editorData } = makeFileAndEditor('file.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.openEditors).toContainEqual(editorData);
    expect(rightPane.current.openEditors).not.toContainEqual(editorData);

    act(() => {
      moveEditorToPane.current({ editorId: editorData.id, fromPaneId: 'RIGHT', toPaneId: 'LEFT' });
    });

    expect(leftPane.current.openEditors).toContainEqual(editorData);
    expect(rightPane.current.openEditors).not.toContainEqual(editorData);
  });

  it('should make another file active, in same pane, after closing the active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA } = makeFileAndEditor('fileA.txt');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.txt');
    const { fileEntry: fileC, editorData: editorDataC } = makeFileAndEditor('fileC.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPane.current.activeEditor!.id).toBe(editorDataC.id);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, editorId: editorDataC.id });
    });

    expect(leftPane.current.activeEditor!.id).toBe(editorDataB.id);
  });

  it('should not make another file active, in same pane, after closing other than the active', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA } = makeFileAndEditor('fileA.txt');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.txt');
    const { fileEntry: fileC, editorData: editorDataC } = makeFileAndEditor('fileC.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPane.current.activeEditor!.id).toBe(editorDataC.id);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, editorId: editorDataB.id });
    });

    expect(leftPane.current.activeEditor!.id).toBe(editorDataC.id);
  });

  it('should make active file undefined if it is the last one closed in the pane', () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const { fileEntry: fileA, editorData: editorDataA } = makeFileAndEditor('fileA.txt');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.txt');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    expect(leftPane.current.activeEditor!.id).toBe(editorDataB.id);

    act(() => {
      closeFileFromPane.current({ paneId: leftPane.current.id, editorId: editorDataB.id });
      closeFileFromPane.current({ paneId: leftPane.current.id, editorId: editorDataA.id });
    });

    expect(leftPane.current.activeEditor).toBeUndefined();
  });

  it('should not open folder entries', () => {
    const store = createStore();
    const openFileResult = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);
    const rightPane = runGetAtomHook(rightPaneAtom, store);

    expect(leftPane.current.openEditors.length).toBe(0);
    expect(rightPane.current.openEditors.length).toBe(0);

    act(() => openFileResult.current(makeFolder('uploads')));

    expect(leftPane.current.openEditors.length).toBe(0);
    expect(rightPane.current.openEditors.length).toBe(0);
  });

  it('should read file content on openFile', async () => {
    const store = createStore();
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const leftPane = runGetAtomHook(leftPaneAtom, store);

    const mockedReadFileContent = vi.mocked(readFileContent).mockResolvedValue({
      type: 'text',
      textContent: 'some content',
    });

    const { fileEntry: fileA } = makeFileAndEditor('fileA.txt');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPane.current.activeEditor?.contentAtoms).toBeDefined();
    const { result: activeFile } = renderHook(() =>
      useAtomValue(leftPane.current.activeEditor!.contentAtoms.loadableEditorContentAtom, { store }),
    );

    expect(activeFile.current.state).toBe('loading');

    await waitFor(() => {
      expect(mockedReadFileContent.mock.calls).toHaveLength(1);
    });

    if (activeFile.current.state !== 'hasData') {
      fail('Data should be available');
    }
    expect(activeFile.current.data).toEqual({ type: 'text', textContent: 'some content' });
  });
});
