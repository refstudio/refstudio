import { atom } from 'jotai';

import { _activePaneAtom, _activePaneIdAtom } from './core/activePane';
import { _fileContentAtom, _loadFile, _unloadFile } from './core/fileContent';
import { _addFileEntry, _removeFileEntry } from './core/fileEntry';
import { _addFileToPane, _paneGroupAtom, _removeFileFromPane, _selectFileInPaneAtom, getPane } from './core/paneGroup';
import { FileEntry, FileId } from './types/FileEntry';
import { PaneFileId, PaneId } from './types/PaneGroup';

/** Open a file in the active pane */
export const openFileAtom = atom(null, (get, set, file: FileEntry) => {
  if (file.isFolder) {
    console.warn('Cannot open directory ', file.path);
    return;
  }
  // Load file in memory
  const currentOpenFiles = get(_fileContentAtom);
  if (!currentOpenFiles.has(file.path)) {
    set(_loadFile, file);
  }

  // Add to file entries atom
  set(_addFileEntry, file);

  // Add file to panes state
  const activePane = get(_activePaneAtom);
  const fileId = file.path;
  if (!activePane.openFiles.includes(fileId)) {
    set(_addFileToPane, { fileId, paneId: activePane.id });
  }

  // Select file in pane
  set(_selectFileInPaneAtom, { fileId, paneId: activePane.id });
});

/** Removes file from the given pane and unload content from memory if the file is not open in another pane */
export const closeFileFromPaneAtom = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(_paneGroupAtom);

  set(_removeFileFromPane, { fileId, paneId });

  // Unload file from memory if the file is no longer open anywhere
  if (
    Object.entries(panes)
      .filter(([_paneId]) => _paneId !== paneId) // Keep only other panes
      .every(([, pane]) => !pane.openFiles.includes(fileId)) // Check that the file was not open in any other pane
  ) {
    set(_removeFileEntry, fileId);
    set(_unloadFile, fileId);
  }

  // Select another file in the pane, if there are any
  const updatedPanes = get(_paneGroupAtom);
  const updatedOpenFiles = updatedPanes[paneId].openFiles;
  if (updatedOpenFiles.length > 0) {
    set(_selectFileInPaneAtom, { fileId: updatedOpenFiles[updatedOpenFiles.length - 1], paneId });
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
  set(_removeFileFromPane, { paneId: fromPaneId, fileId });
  set(_addFileToPane, { paneId: toPaneId, fileId });
  set(_selectFileInPaneAtom, { paneId: toPaneId, fileId });
});

export const focusPaneAtom = atom(null, (_get, set, paneId: PaneId) => {
  set(_activePaneIdAtom, paneId);
});

export const selectFileInPaneAtom = atom(null, (get, set, paneFileId: PaneFileId) => {
  set(_selectFileInPaneAtom, paneFileId);
});
