import { createStore, useAtomValue } from 'jotai';

import { readFileContent } from '../../io/filesystem';
import { act, renderHook, waitFor } from '../../test/test-utils';
import { ReferenceItem } from '../../types/ReferenceItem';
import { activePaneIdAtom } from '../core/activePane';
import {
  closeAllEditorsAtom,
  closeEditorFromAllPanesAtom,
  closeEditorFromPaneAtom,
  moveEditorToPaneAtom,
  openReferenceAtom,
  selectEditorInPaneAtom,
} from '../editorActions';
import { openFileEntryAtom, openFilePathAtom } from '../fileEntryActions';
import { useActiveEditorContentAtomsForPane } from '../hooks/useActiveEditorContentAtomsForPane';
import { useActiveEditorIdForPane } from '../hooks/useActiveEditorIdForPane';
import { useOpenEditorsCountForPane } from '../hooks/useOpenEditorsCountForPane';
import { useOpenEditorsDataForPane } from '../hooks/useOpenEditorsDataForPane';
import { setReferencesAtom } from '../referencesState';
import { EditorContent } from '../types/EditorContent';
import { buildEditorId, EditorData, EditorId } from '../types/EditorData';
import { PaneId } from '../types/PaneGroup';
import { makeFileAndEditor, makeFolder } from './test-fixtures';
import { runHookWithJotaiProvider, runSetAtomHook } from './test-utils';

vi.mock('../../io/filesystem');

describe('editorActions', () => {
  let store: ReturnType<typeof createStore>;

  let leftPaneOpenEditorsCount: { current: number };
  let leftPaneActiveEditorId: { current: EditorId | null };
  let leftPaneOpenEditorsData: { current: EditorData[] };

  let rightPaneOpenEditorsCount: { current: number };
  let rightPaneActiveEditorId: { current: EditorId | null };
  let rightPaneOpenEditorsData: { current: EditorData[] };

  beforeEach(() => {
    store = createStore();
    leftPaneOpenEditorsCount = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('LEFT'), store);
    leftPaneActiveEditorId = runHookWithJotaiProvider(() => useActiveEditorIdForPane('LEFT'), store);
    leftPaneOpenEditorsData = runHookWithJotaiProvider(() => useOpenEditorsDataForPane('LEFT'), store);

    rightPaneOpenEditorsCount = runHookWithJotaiProvider(() => useOpenEditorsCountForPane('RIGHT'), store);
    rightPaneActiveEditorId = runHookWithJotaiProvider(() => useActiveEditorIdForPane('RIGHT'), store);
    rightPaneOpenEditorsData = runHookWithJotaiProvider(() => useOpenEditorsDataForPane('RIGHT'), store);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be empty by default', () => {
    expect(leftPaneOpenEditorsCount.current).toBe(0);
    expect(leftPaneActiveEditorId.current).toBeNull();
    expect(rightPaneOpenEditorsCount.current).toBe(0);
    expect(rightPaneActiveEditorId.current).toBeNull();
  });

  it('should open REFSTUDIO file in the left pane, and be active', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);

    const { fileEntry: fileToOpen, editorData } = makeFileAndEditor('file.refstudio');
    expect(leftPaneOpenEditorsCount.current).toBe(0);
    expect(leftPaneActiveEditorId.current).toBeNull();

    act(() => openFile.current(fileToOpen));

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('LEFT');
    expect(leftPaneOpenEditorsCount.current).toBe(1);
    expect(leftPaneOpenEditorsData.current[0]).toStrictEqual(editorData);
    expect(leftPaneActiveEditorId.current).toBe(editorData.id);
  });

  it('should open REFSTUDIO filePath in the left pane, and be active', () => {
    const openFile = runSetAtomHook(openFilePathAtom, store);

    const filePath = '/some/absolute/path/file.refstudio';
    act(() => openFile.current(filePath));

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('LEFT');
    expect(leftPaneOpenEditorsCount.current).toBe(1);

    const editorId = buildEditorId('refstudio', filePath);
    expect(leftPaneActiveEditorId.current).toBe(editorId);
  });

  it('should open file with no extension in the left pane, and be active', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);

    const { fileEntry: fileToOpen, editorData } = makeFileAndEditor('file');
    expect(leftPaneOpenEditorsCount.current).toBe(0);
    expect(leftPaneActiveEditorId.current).toBeNull();

    act(() => openFile.current(fileToOpen));

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('LEFT');
    expect(leftPaneOpenEditorsCount.current).toBe(1);
    expect(leftPaneOpenEditorsData.current[0]).toStrictEqual(editorData);
    expect(leftPaneActiveEditorId.current).toBe(editorData.id);
  });

  it('should open filePath with no extension in the left pane, and be active', () => {
    const openFile = runSetAtomHook(openFilePathAtom, store);

    const filePath = '/some/absolute/path/file';
    act(() => openFile.current(filePath));

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('LEFT');
    expect(leftPaneOpenEditorsCount.current).toBe(1);

    const editorId = buildEditorId('refstudio', filePath);
    expect(leftPaneActiveEditorId.current).toBe(editorId);
  });

  it('should open PDF file in the right pane, and be active', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);

    const { fileEntry: fileToOpen, editorData } = makeFileAndEditor('file.pdf');
    expect(rightPaneOpenEditorsData.current).not.toContainEqual(fileToOpen);
    expect(rightPaneActiveEditorId.current).toBeNull();

    act(() => openFile.current(fileToOpen));

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('RIGHT');
    expect(rightPaneOpenEditorsCount.current).toBe(1);
    expect(rightPaneOpenEditorsData.current).toContainEqual(editorData);
    expect(rightPaneActiveEditorId.current).toBe(editorData.id);
  });

  it('should open file once in same panel', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);

    const { fileEntry: fileToOpen } = makeFileAndEditor('file.refstudio');
    expect(leftPaneOpenEditorsCount.current).toBe(0);

    act(() => {
      openFile.current(fileToOpen);
      openFile.current(fileToOpen);
    });

    expect(leftPaneOpenEditorsCount.current).toBe(1);
  });

  it('should open Reference in the right pane, and make it active', () => {
    const setReferences = runSetAtomHook(setReferencesAtom, store);
    const openReference = runSetAtomHook(openReferenceAtom, store);

    const reference: ReferenceItem = {
      id: 'reference',
      filepath: '/path/to/reference.pdf',
      filename: 'reference.pdf',
      citationKey: 'citationKey',
      title: 'Reference',
      status: 'complete',
      doi: '0000',
      authors: [],
    };
    const editorId = buildEditorId('reference', reference.id);

    expect(rightPaneOpenEditorsData.current.map(({ id }) => id)).not.toContain(editorId);
    expect(rightPaneActiveEditorId.current).toBeNull();

    act(() => {
      setReferences.current([reference]);
      openReference.current(reference.id);
    });

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('RIGHT');
    expect(rightPaneOpenEditorsCount.current).toBe(1);
    expect(rightPaneOpenEditorsData.current.map(({ id }) => id)).toContain(editorId);
    expect(rightPaneActiveEditorId.current).toBe(editorId);
  });

  it('should close opened file in same pane', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);

    const { fileEntry: fileA, editorData: editorDataA } = makeFileAndEditor('fileA.refstudio');
    const { fileEntry: fileB } = makeFileAndEditor('fileB.refstudio');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });
    expect(leftPaneOpenEditorsCount.current).toBe(2);

    act(() => {
      closeFileFromPane.current({ paneId: 'LEFT', editorId: editorDataA.id });
    });

    expect(leftPaneOpenEditorsCount.current).toBe(1);
  });

  it('should close opened files from all panes', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeEditorFromAllPanes = runSetAtomHook(closeEditorFromAllPanesAtom, store);

    const { fileEntry: fileA, editorData: editorDataA } = makeFileAndEditor('fileA.refstudio');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.pdf');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });
    expect(leftPaneOpenEditorsCount.current).toBe(1);
    expect(rightPaneOpenEditorsCount.current).toBe(1);

    act(() => {
      closeEditorFromAllPanes.current(editorDataA.id);
      closeEditorFromAllPanes.current(editorDataB.id);
    });

    expect(leftPaneOpenEditorsCount.current).toBe(0);
    expect(rightPaneOpenEditorsCount.current).toBe(0);
  });

  it('should not fail trying to close file that is not opened in pane', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);

    const { fileEntry: fileOpened, editorData: openedEditorData } = makeFileAndEditor('fileA.refstudio');
    const { editorData: notOpenedEditorData } = makeFileAndEditor('fileB.refstudio');

    act(() => {
      openFile.current(fileOpened);
    });

    expect(leftPaneOpenEditorsData.current).toContainEqual(openedEditorData);
    expect(leftPaneOpenEditorsData.current).not.toContainEqual(notOpenedEditorData);

    act(() => {
      closeFileFromPane.current({ paneId: 'LEFT', editorId: notOpenedEditorData.id });
    });

    expect(leftPaneOpenEditorsData.current).toContainEqual(openedEditorData);
    expect(leftPaneOpenEditorsData.current).not.toContainEqual(notOpenedEditorData);
  });

  it('should not fail trying to select file that is not opened in pane', () => {
    const selectFileInPane = runSetAtomHook(selectEditorInPaneAtom, store);

    const { editorData } = makeFileAndEditor('fileA.refstudio');

    act(() => {
      selectFileInPane.current({ paneId: 'LEFT', editorId: editorData.id });
    });

    expect(leftPaneOpenEditorsData.current).not.toContainEqual(editorData);
  });

  it('should not fail when trying to open a reference that does not exist', () => {
    const openReference = runSetAtomHook(openReferenceAtom, store);

    const reference: ReferenceItem = {
      id: 'reference',
      filepath: '/path/to/reference.pdf',
      filename: 'reference.pdf',
      citationKey: 'citationKey',
      title: 'Reference',
      status: 'complete',
      doi: '0000',
      authors: [],
    };
    const editorId = buildEditorId('reference', reference.id);

    expect(rightPaneOpenEditorsData.current.map(({ id }) => id)).not.toContainEqual(editorId);
    expect(rightPaneActiveEditorId.current).toBeNull();

    act(() => {
      openReference.current(reference.id);
    });

    expect(rightPaneOpenEditorsData.current.map(({ id }) => id)).not.toContainEqual(editorId);
    expect(rightPaneActiveEditorId.current).toBeNull();
  });

  it('should close all opened files with closeAllFilesAtom', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeAllFiles = runSetAtomHook(closeAllEditorsAtom, store);

    const { fileEntry: fileA, editorData: fileAData } = makeFileAndEditor('file.refstudio');
    const { fileEntry: fileB, editorData: fileBData } = makeFileAndEditor('file.pdf');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    const paneFiles = [...leftPaneOpenEditorsData.current, ...rightPaneOpenEditorsData.current];
    expect(paneFiles).toContainEqual(fileAData);
    expect(paneFiles).toContainEqual(fileBData);

    act(() => closeAllFiles.current());

    const totalOpenedFiles = leftPaneOpenEditorsCount.current + rightPaneOpenEditorsCount.current;
    expect(totalOpenedFiles).toBe(0);
  });

  it('should move file from one tab to the other', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry, editorData } = makeFileAndEditor('file.refstudio');

    act(() => {
      openFile.current(fileEntry);
    });

    expect(leftPaneOpenEditorsData.current).toContainEqual(editorData);
    expect(rightPaneOpenEditorsData.current).not.toContainEqual(editorData);

    act(() => {
      moveEditorToPane.current({ editorId: editorData.id, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
    });

    expect(leftPaneOpenEditorsData.current).not.toContainEqual(editorData);
    expect(rightPaneOpenEditorsData.current).toContainEqual(editorData);
  });

  it('should move file from one tab to same tab', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry: fileA, editorData } = makeFileAndEditor('file.refstudio');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPaneOpenEditorsData.current).toContainEqual(editorData);
    expect(rightPaneOpenEditorsData.current).not.toContainEqual(editorData);

    act(() => {
      moveEditorToPane.current({ editorId: editorData.id, fromPaneId: 'LEFT', toPaneId: 'LEFT' });
    });

    expect(leftPaneOpenEditorsData.current).toContainEqual(editorData);
    expect(rightPaneOpenEditorsData.current).not.toContainEqual(editorData);
  });

  it('should make remaining file active when moving file from one pane to another', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry: fileA, editorData: fileAData } = makeFileAndEditor('file1.refstudio');
    const { fileEntry: fileB, editorData: fileBData } = makeFileAndEditor('file2.refstudio');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('LEFT');
    expect(leftPaneActiveEditorId.current).toBe(fileBData.id);

    act(() => {
      moveEditorToPane.current({ editorId: fileBData.id, fromPaneId: 'LEFT', toPaneId: 'RIGHT' });
    });

    expect(store.get(activePaneIdAtom)).toBe<PaneId>('RIGHT');

    expect(leftPaneOpenEditorsData.current).toContainEqual(fileAData);
    expect(leftPaneActiveEditorId.current).toBe(fileAData.id);
    expect(rightPaneOpenEditorsData.current).toContainEqual(fileBData);
    expect(rightPaneActiveEditorId.current).toBe(fileBData.id);
  });

  it('should NOT move file if file is NOT opened', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const moveEditorToPane = runSetAtomHook(moveEditorToPaneAtom, store);

    const { fileEntry: fileA, editorData } = makeFileAndEditor('file.refstudio');

    act(() => {
      openFile.current(fileA);
    });

    expect(leftPaneOpenEditorsData.current).toContainEqual(editorData);
    expect(rightPaneOpenEditorsData.current).not.toContainEqual(editorData);

    act(() => {
      moveEditorToPane.current({ editorId: editorData.id, fromPaneId: 'RIGHT', toPaneId: 'LEFT' });
    });

    expect(leftPaneOpenEditorsData.current).toContainEqual(editorData);
    expect(rightPaneOpenEditorsData.current).not.toContainEqual(editorData);
  });

  it('should make another file active, in same pane, after closing the active', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);

    const { fileEntry: fileA } = makeFileAndEditor('fileA.refstudio');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.refstudio');
    const { fileEntry: fileC, editorData: editorDataC } = makeFileAndEditor('fileC.refstudio');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPaneActiveEditorId.current).toBe(editorDataC.id);

    act(() => {
      closeFileFromPane.current({ paneId: 'LEFT', editorId: editorDataC.id });
    });

    expect(leftPaneActiveEditorId.current).toBe(editorDataB.id);
  });

  it('should not make another file active, in same pane, after closing other than the active', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);

    const { fileEntry: fileA } = makeFileAndEditor('fileA.refstudio');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.refstudio');
    const { fileEntry: fileC, editorData: editorDataC } = makeFileAndEditor('fileC.refstudio');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
      openFile.current(fileC);
    });

    expect(leftPaneActiveEditorId.current).toBe(editorDataC.id);

    act(() => {
      closeFileFromPane.current({ paneId: 'LEFT', editorId: editorDataB.id });
    });

    expect(leftPaneActiveEditorId.current).toBe(editorDataC.id);
  });

  it('should make active file undefined if it is the last one closed in the pane', () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);
    const closeFileFromPane = runSetAtomHook(closeEditorFromPaneAtom, store);

    const { fileEntry: fileA, editorData: editorDataA } = makeFileAndEditor('fileA.refstudio');
    const { fileEntry: fileB, editorData: editorDataB } = makeFileAndEditor('fileB.refstudio');

    act(() => {
      openFile.current(fileA);
      openFile.current(fileB);
    });

    expect(leftPaneActiveEditorId.current).toBe(editorDataB.id);

    act(() => {
      closeFileFromPane.current({ paneId: 'LEFT', editorId: editorDataB.id });
      closeFileFromPane.current({ paneId: 'LEFT', editorId: editorDataA.id });
    });

    expect(leftPaneActiveEditorId.current).toBeNull();
  });

  it('should not open folder entries', () => {
    const openFileResult = runSetAtomHook(openFileEntryAtom, store);

    expect(leftPaneOpenEditorsCount.current).toBe(0);
    expect(rightPaneOpenEditorsCount.current).toBe(0);

    act(() => openFileResult.current(makeFolder('uploads')));

    expect(leftPaneOpenEditorsCount.current).toBe(0);
    expect(rightPaneOpenEditorsCount.current).toBe(0);
  });

  it('should read file content on openFile', async () => {
    const openFile = runSetAtomHook(openFileEntryAtom, store);

    const mockedReadFileContent = vi.mocked(readFileContent).mockResolvedValue({
      type: 'refstudio',
      jsonContent: { doc: 'some content' },
    });

    const { fileEntry: fileA } = makeFileAndEditor('fileA.refstudio');

    act(() => {
      openFile.current(fileA);
    });

    const leftPaneActiveContentAtoms = runHookWithJotaiProvider(() => useActiveEditorContentAtomsForPane('LEFT'), store)
      .current!;

    expect(leftPaneActiveContentAtoms).not.toBeNull();
    const { result: activeFile } = renderHook(() =>
      useAtomValue(leftPaneActiveContentAtoms.loadableEditorContentAtom, { store }),
    );

    expect(activeFile.current.state).toBe('loading');

    await waitFor(() => {
      expect(mockedReadFileContent).toHaveBeenCalledTimes(1);
    });

    if (activeFile.current.state !== 'hasData') {
      fail('Data should be available');
    }
    expect(activeFile.current.data).toEqual<EditorContent>({ type: 'refstudio', jsonContent: { doc: 'some content' } });
  });
});
