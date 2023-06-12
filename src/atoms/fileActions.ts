import { atom } from 'jotai';

import { activePaneIdAtom } from './core/activePane';
import { fileContentAtom, loadFile, unloadFile } from './core/fileContent';
import { addFileEntry, removeFileEntry } from './core/fileEntry';
import { addFileToPane, getPane, paneGroupAtom, removeFileFromPane, selectFileInPaneAtom } from './core/paneGroup';
import { FileEntry, FileFileEntry, FileId } from './types/FileEntry';
import { PaneFileId, PaneId } from './types/PaneGroup';

export { activePaneAtom } from './core/activePane';
export { selectFileInPaneAtom } from './core/paneGroup';

/** Open a file in the a pane (depending on the file extension) */
export const openFileAtom = atom(null, (get, set, file: FileEntry) => {
  if (file.isFolder) {
    console.warn('Cannot open directory ', file.path);
    return;
  }
  // Load file in memory
  const currentOpenFiles = get(fileContentAtom);
  if (!currentOpenFiles.has(file.path)) {
    set(loadFile, file);
  }

  // Add to file entries atom
  set(addFileEntry, file);

  // Add file to panes state
  const targetPaneId = targetPaneIdFor(file);
  const fileId = file.path;
  set(addFileToPane, { fileId, paneId: targetPaneId });

  // Select file in pane
  set(selectFileInPaneAtom, { fileId, paneId: targetPaneId });
});

/** Removes file from the given pane and unload content from memory if the file is not open in another pane */
export const closeFileFromPaneAtom = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(paneGroupAtom);

  set(removeFileFromPane, { fileId, paneId });

  // Unload file from memory if the file is no longer open anywhere
  if (
    Object.entries(panes)
      .filter(([_paneId]) => _paneId !== paneId) // Keep only other panes
      .every(([, pane]) => !pane.openFiles.includes(fileId)) // Check that the file was not open in any other pane
  ) {
    set(removeFileEntry, fileId);
    set(unloadFile, fileId);
  }

  // Select another file in the pane, if there are any
  const updatedPanes = get(paneGroupAtom);
  const updatedOpenFiles = updatedPanes[paneId].openFiles;
  if (updatedOpenFiles.length > 0) {
    set(selectFileInPaneAtom, { fileId: updatedOpenFiles[updatedOpenFiles.length - 1], paneId });
  }
});

export const leftPaneAtom = atom((get) => getPane(get, 'LEFT'));
export const rightPaneAtom = atom((get) => getPane(get, 'RIGHT'));

interface SplitFilePayload {
  fileId: FileId;
  fromPaneId: PaneId;
  toPaneId: PaneId;
}

export const splitFileToPaneAtom = atom(null, (_get, set, { fileId, fromPaneId, toPaneId }: SplitFilePayload) => {
  set(removeFileFromPane, { paneId: fromPaneId, fileId });
  set(addFileToPane, { paneId: toPaneId, fileId });
  set(selectFileInPaneAtom, { paneId: toPaneId, fileId });
});

export const focusPaneAtom = atom(null, (_get, set, paneId: PaneId) => {
  set(activePaneIdAtom, paneId);
});

export const closeAllFilesAtom = atom(null, (get, set) => {
  const panes = get(paneGroupAtom);
  panes.LEFT.openFiles.forEach((file) => set(closeFileFromPaneAtom, { fileId: file, paneId: 'LEFT' }));
  panes.RIGHT.openFiles.forEach((file) => set(closeFileFromPaneAtom, { fileId: file, paneId: 'RIGHT' }));
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
