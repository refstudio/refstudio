import { atom } from 'jotai';

import { editorsContentStateAtom, loadEditorContent, loadFileEntry, unloadEditorContent } from './core/editorContent';
import { addEditorData, removeEditorData } from './core/editorData';
import { addEditorToPane, paneGroupAtom, removeEditorFromPane, selectEditorInPaneAtom } from './core/paneGroup';
import { getDerivedReferenceAtom } from './referencesState';
import { buildEditorId, EditorId } from './types/EditorData';
import { FileEntry, FileFileEntry } from './types/FileEntry';
import { PaneEditorId, PaneId } from './types/PaneGroup';

export { activePaneAtom } from './core/activePane';
export { selectEditorInPaneAtom } from './core/paneGroup';

/** Open a file in a pane (depending on the file extension) */
export const openFileEntryAtom = atom(null, (get, set, file: FileEntry) => {
  if (file.isFolder) {
    console.warn('Cannot open directory ', file.path);
    return;
  }

  const editorId = buildEditorId('text', file.path);
  // Load file in memory
  const currentOpenEditors = get(editorsContentStateAtom);
  if (!currentOpenEditors.has(editorId)) {
    set(loadFileEntry, file);
  }

  // Add to editor entries atom
  set(addEditorData, { id: editorId, title: file.name });

  // Add editor to panes state
  const targetPaneId = targetPaneIdFor(file);
  set(addEditorToPane, { editorId, paneId: targetPaneId });

  // Select editor in pane
  set(selectEditorInPaneAtom, { editorId, paneId: targetPaneId });
});

export const openFilePathAtom = atom(null, (get, set, filePath: string) => {
  const fileEntry: FileFileEntry = {
    path: filePath,
    name: filePath.split('/').pop() ?? '',
    fileExtension: filePath.split('.').pop() ?? '',
    isDotfile: false,
    isFile: true,
    isFolder: false,
  };
  set(openFileEntryAtom, fileEntry);
});

/** Open a reference in the right pane */
export const openReferenceAtom = atom(null, (get, set, referenceId: string) => {
  const editorId = buildEditorId('reference', referenceId);

  const reference = get(getDerivedReferenceAtom(referenceId));
  if (!reference) {
    console.warn('This reference does not exist');
    return;
  }

  // Load editor in memory
  const currentOpenEditors = get(editorsContentStateAtom);
  if (!currentOpenEditors.has(editorId)) {
    set(loadEditorContent, { editorId, editorContent: { type: 'reference', referenceId: editorId } });
  }

  // Add to editor entries atom
  set(addEditorData, { id: editorId, title: reference.title });

  // Add editor to panes state
  const paneId: PaneId = 'RIGHT';
  set(addEditorToPane, { editorId, paneId });

  // Select editor in pane
  set(selectEditorInPaneAtom, { editorId, paneId });
});

/** Open the references pane in the right pane */
export const openReferencesAtom = atom(null, (_get, set, filter?: string) => {
  const editorId = buildEditorId('references');

  // Load in memory
  set(loadEditorContent, { editorId, editorContent: { type: 'references', filter } });

  // Add to editor entries atom
  set(addEditorData, { id: editorId, title: 'RefStudio References' });

  const paneId: PaneId = 'RIGHT';
  // Add editor to panes state
  set(addEditorToPane, { editorId, paneId });

  // Select editor in pane
  set(selectEditorInPaneAtom, { editorId, paneId });
});

/** Removes editor from the given pane and unload content from memory if the editor is not open in another pane */
export const closeEditorFromPaneAtom = atom(null, (get, set, { editorId, paneId }: PaneEditorId) => {
  const panes = get(paneGroupAtom);

  set(removeEditorFromPane, { editorId, paneId });

  // Unload editor from memory if the editor is no longer open anywhere
  if (
    Object.entries(panes)
      .filter(([_paneId]) => _paneId !== paneId) // Keep only other panes
      .every(([, pane]) => !pane.openEditorIds.includes(editorId)) // Check that the editor was not open in any other pane
  ) {
    set(removeEditorData, editorId);
    set(unloadEditorContent, editorId);
  }
});

export const closeAllEditorsAtom = atom(null, (get, set) => {
  const panes = get(paneGroupAtom);
  panes.LEFT.openEditorIds.forEach((editorId) => set(closeEditorFromPaneAtom, { editorId, paneId: 'LEFT' }));
  panes.RIGHT.openEditorIds.forEach((editorId) => set(closeEditorFromPaneAtom, { editorId, paneId: 'RIGHT' }));
});

interface MoveEditorPayload {
  editorId: EditorId;
  fromPaneId: PaneId;
  toPaneId: PaneId;
}

export const moveEditorToPaneAtom = atom(null, (_get, set, { editorId, fromPaneId, toPaneId }: MoveEditorPayload) => {
  set(removeEditorFromPane, { paneId: fromPaneId, editorId });
  set(addEditorToPane, { paneId: toPaneId, editorId });
  set(selectEditorInPaneAtom, { paneId: toPaneId, editorId });
});

function targetPaneIdFor(file: FileFileEntry): PaneId {
  switch (file.fileExtension) {
    case 'pdf':
    case 'xml':
    case 'json':
      return 'RIGHT';
    default:
      return 'LEFT';
  }
}
