import { atom, Getter } from 'jotai';

import { isNonNullish } from '../../lib/isNonNullish';
import { PaneContent, PaneFileId, PaneId, PaneState } from '../types/PaneGroup';
import { activePaneIdAtom } from './activePane';
import { fileContentAtom } from './fileContent';
import { filesDataAtom } from './fileData';

type PaneGroupState = Record<PaneId, PaneState>;

/** This atom contains data about the panes: the list of open files and the active file */
export const paneGroupAtom = atom<PaneGroupState>({
  LEFT: {
    openFiles: [],
  },
  RIGHT: {
    openFiles: [],
  },
});

export function getPane(get: Getter, paneId: PaneId): PaneContent {
  const panes = get(paneGroupAtom);
  const filesData = get(filesDataAtom);
  const openFiles = get(fileContentAtom);
  const pane = panes[paneId];
  return {
    id: paneId,
    files: pane.openFiles.map((id) => filesData.get(id)).filter(isNonNullish),
    activeFile: pane.activeFile,
    activeFileContent: pane.activeFile ? openFiles.get(pane.activeFile) : undefined,
  };
}

/** Updates a given pane with partial attributes */
export const updatePaneGroup = atom(
  null,
  (get, set, { paneId, ...update }: { paneId: PaneId } & Partial<PaneState>) => {
    const panes = get(paneGroupAtom);
    set(paneGroupAtom, {
      ...panes,
      [paneId]: {
        ...panes[paneId],
        ...update,
      },
    });
  },
);

/**
 * Adds a file to the list of open files of the given pane
 * Please note that this atom does not check that file exists or is loaded in memory
 * */
export const addFileToPane = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(paneGroupAtom);
  set(updatePaneGroup, {
    paneId,
    openFiles: panes[paneId].openFiles.includes(fileId)
      ? panes[paneId].openFiles // File was already open
      : [...panes[paneId].openFiles, fileId], // Add file to the list of open files
  });
});

/** Removes a file from the list of open files */
export const removeFileFromPane = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(paneGroupAtom);

  if (!panes[paneId].openFiles.includes(fileId)) {
    console.warn('File is not open in the given pane ', fileId, paneId);
    return;
  }

  const updatedOpenFiles = panes[paneId].openFiles.filter((_fileId) => _fileId !== fileId);

  // If the active file was the file being removed, make the last file of the pane the active one
  let updatedActiveFile = panes[paneId].activeFile;
  if (updatedActiveFile === fileId) {
    updatedActiveFile = updatedOpenFiles.length > 0 ? updatedOpenFiles[updatedOpenFiles.length - 1] : undefined;
  }

  set(updatePaneGroup, {
    paneId,
    openFiles: updatedOpenFiles,
    activeFile: updatedActiveFile,
  });
});

/** Updates the active file of the pane */
export const selectFileInPaneAtom = atom(null, (get, set, { fileId, paneId }: PaneFileId) => {
  const panes = get(paneGroupAtom);

  if (!panes[paneId].openFiles.includes(fileId)) {
    console.warn('File not open in the given pane ', fileId, paneId);
    return;
  }

  set(activePaneIdAtom, paneId);
  set(updatePaneGroup, {
    paneId,
    activeFile: fileId,
  });
});
