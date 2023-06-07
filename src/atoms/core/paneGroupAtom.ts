/* eslint-disable no-underscore-dangle */
import { atom, Getter } from 'jotai';

import { isNonNullish } from '../../lib/isNonNullish';
import { _activePaneIdAtom } from './activePaneAtom';
import { PaneFileId, PaneId, PaneState } from './atom.types';
import { _fileContentAtom } from './fileContentAtom';
import { _fileEntryAtom } from './fileEntryAtom';

type PaneGroupState = Record<PaneId, PaneState>;

/**
 * This atom contains data about the panes: the list of open files and the active file
 *
 * 3 action atoms are available:
 *  - `_addFileToPane` to add a file to the list of open files of the given pane; please note that this atom does not check that file exists or is loaded in memory
 *  - `_removeFileFromPane` to remove a file from the list of open files
 *  - `_selectFileInPaneAtom` to update the active file of the pane; please note that this atom does not check that the file is actually open in the pane
 *
 * NOTE: This is a core atom file and it should never been used outside of the `atoms` directory of this project
 */
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
});

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
