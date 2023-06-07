import { atom } from 'jotai';

import { FileEntry } from '../types/FileEntry';
import { _activePaneAtom } from './core/activePaneAtom';
import { FileId, PaneFileId, PaneId } from './core/atom.types';
import { _fileContentAtom, _loadFileInMemory, _unloadFileFromMemory } from './core/fileContentAtom';
import { _addFileEntry, _removeFileEntry } from './core/fileEntryAtom';
import {
  _addFileToPane,
  _paneGroupAtom,
  _removeFileFromPane,
  _selectFileInPaneAtom,
  getPane,
} from './core/paneGroupAtom';

/**
 * Open a file in the active pane
 */
export const openFileAtom = atom(null, (get, set, file: FileEntry) => {
  if (file.isFolder) {
    console.warn('Cannot open directory ', file.path);
    return;
  }
  // Load file in memory
  const currentOpenFiles = get(_fileContentAtom);
  if (!currentOpenFiles.has(file.path)) {
    set(_loadFileInMemory, file);
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

/**
 * Removes file from the given pane and unload content from memory if the file is not open in another pane
 */
export const closeFileFromPaneAtom = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const currentOpenFiles = get(_fileContentAtom);
  if (!currentOpenFiles.has(fileId)) {
    console.warn('File is not open ', fileId);
    return;
  }
  const panes = get(_paneGroupAtom);
  if (!panes[paneId].openFiles.includes(fileId)) {
    console.warn('File is not open in the given pane ', fileId, paneId);
    return;
  }

  set(_removeFileFromPane, { fileId, paneId });

  // Unload file from memory if the file is no longer open anywhere
  if (
    Object.entries(panes)
      .filter(([_paneId]) => _paneId !== paneId) // Keep only other panes
      .every(([, pane]) => !pane.openFiles.includes(fileId)) // Check that the file was not open in any other pane
  ) {
    set(_removeFileEntry, fileId);
    set(_unloadFileFromMemory, fileId);
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
