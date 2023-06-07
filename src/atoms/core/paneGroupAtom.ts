/* eslint-disable no-underscore-dangle */
import { atom, Getter } from 'jotai';

import { isNonNullish } from '../../lib/isNonNullish';
import { _activePaneIdAtom } from './activePaneAtom';
import { PaneFileId, PaneId, PaneState } from './atom.types';
import { _fileContentAtom } from './fileContentAtom';
import { _fileEntryAtom } from './fileEntryAtom';

type PaneGroupState = Record<PaneId, PaneState>;

// Base atom
export const _paneGroupAtom = atom<PaneGroupState>({
  LEFT: {
    openFiles: [],
  },
  RIGHT: {
    openFiles: [],
  },
});

export function getPane(get: Getter, paneId: PaneId) {
  const panes = get(_paneGroupAtom);
  const fileEntries = get(_fileEntryAtom);
  const openFiles = get(_fileContentAtom);
  const pane = panes[paneId];
  return {
    id: paneId,
    files: pane.openFiles.map((id) => fileEntries.get(id)).filter(isNonNullish),
    activeFile: pane.activeFile ? fileEntries.get(pane.activeFile) : undefined,
    activeFileAtom: pane.activeFile ? openFiles.get(pane.activeFile) : undefined,
  };
}

/**
 * Add file to a given pane
 */
export const _addFileToPane = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(_paneGroupAtom);
  set(_paneGroupAtom, {
    ...panes,
    [paneId]: {
      ...panes[paneId],
      openFiles: panes[paneId].openFiles.includes(fileId)
        ? panes[paneId].openFiles // File was already open
        : [...panes[paneId].openFiles, fileId], // Add file to the list of open files
    },
  });
});

/**
 * Remove file from a given pane
 */
export const _removeFileFromPane = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(_paneGroupAtom);
  const updatedOpenFiles = panes[paneId].openFiles.filter((_fileId) => _fileId !== fileId);
  set(_paneGroupAtom, {
    ...panes,
    [paneId]: {
      ...panes[paneId],
      openFiles: updatedOpenFiles,
    },
  });
  if (updatedOpenFiles.length > 0) {
    set(_selectFileInPaneAtom, { fileId: updatedOpenFiles[updatedOpenFiles.length - 1], paneId });
  }
});

/**
 * Select a file in the given pane, the file must already be in the pane
 */
export const _selectFileInPaneAtom = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(_paneGroupAtom);
  set(_activePaneIdAtom, paneId);
  set(_paneGroupAtom, {
    ...panes,
    [paneId]: {
      ...panes[paneId],
      activeFile: fileId,
    },
  });
});
