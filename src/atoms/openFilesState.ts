import { FileEntry } from '@tauri-apps/api/fs';
import { atom, Getter } from 'jotai';

export type PaneId = 'LEFT' | 'RIGHT';
export const DEFAULT_PANE: PaneId = 'LEFT';
type FileId = string;

interface OpenFilesState {
  files: Record<FileId, FileEntry>;
  panes: Record<PaneId, PaneState>;
}

interface PaneState {
  id: PaneId;
  openFiles: FileId[];
  activeFile?: FileId;
}

export const openFilesAtom = atom<OpenFilesState>({
  files: {},
  panes: {
    LEFT: {
      id: 'LEFT',
      openFiles: [],
      activeFile: undefined,
    },
    RIGHT: {
      id: 'RIGHT',
      openFiles: [],
      activeFile: undefined,
    },
  },
});

export const leftPaneAtom = atom((get) => getPane(get, 'LEFT'));
export const rightPaneAtom = atom((get) => getPane(get, 'RIGHT'));

function getPane(get: Getter, paneId: PaneId) {
  const { files, panes } = get(openFilesAtom);
  const pane = panes[paneId];
  return {
    id: pane.id,
    files: pane.openFiles.map((id) => files[id] as FileEntry | undefined).filter((f) => f) as FileEntry[],
    active: pane.activeFile ? files[pane.activeFile] : undefined,
  };
}

export const openFileInPaneAtom = atom(null, (get, set, update: { pane: PaneId; file: FileEntry }) => {
  const state = get(openFilesAtom);
  const updatedState = openFileAction(state, update.pane, update.file);
  set(openFilesAtom, updatedState);
});

export const activateFileInPaneAtom = atom(null, (get, set, update: { pane: PaneId; path: string }) => {
  const state = get(openFilesAtom);
  const updatedState = activateFileAction(state, update.pane, update.path);
  set(openFilesAtom, updatedState);
});

export const closeFileInPaneAtom = atom(null, (get, set, update: { pane: PaneId; path: string }) => {
  const state = get(openFilesAtom);
  const { pane, path } = update;
  const file = state.files[path] as FileEntry | undefined;
  if (file === undefined) {
    console.warn('Cannot find the file ', path);
  } else {
    const updatedState = closeFileAction(state, pane, file);
    set(openFilesAtom, updatedState);
  }
});

export const splitFileToPaneAtom = atom(
  null,
  (get, set, update: { fromPane: PaneId; toPane: PaneId; file: FileEntry }) => {
    const state = get(openFilesAtom);
    const { fromPane, toPane, file } = update;
    const updatedState = splitFileAction(state, file, fromPane, toPane);
    set(openFilesAtom, updatedState);
  },
);

/** ############################################################################################
 * state mutation utilities
 ############################################################################################ */
function openFileAction(state: OpenFilesState, pane: PaneId, file: FileEntry) {
  const isFileOpenInPane = state.panes[pane].openFiles.includes(file.path);
  const newState: OpenFilesState = {
    ...state,
    files: {
      ...state.files,
      [file.path]: file, // Add new file record
    },
    panes: {
      ...state.panes,
      [pane]: {
        ...state.panes[pane],
        openFiles: !isFileOpenInPane
          ? [...state.panes[pane].openFiles, file.path] // Add new path
          : state.panes[pane].openFiles,
        activeFile: file.path, // Make file active
      },
    },
  };
  return newState;
}

function activateFileAction(state: OpenFilesState, pane: PaneId, path: string) {
  return {
    ...state,
    panes: {
      ...state.panes,
      [pane]: {
        ...state.panes[pane],
        activeFile: path,
      },
    },
  };
}

function closeFileAction(state: OpenFilesState, pane: PaneId, file: FileEntry) {
  const newState = {
    ...state,
  };
  const panesPane = newState.panes[pane];
  panesPane.openFiles = panesPane.openFiles.filter((f) => f !== file.path);
  if (panesPane.activeFile === file.path) {
    panesPane.activeFile = [...panesPane.openFiles][0];
  }
  return newState;
}

function splitFileAction(state: OpenFilesState, file: FileEntry, fromPane: PaneId, toPane: PaneId) {
  const afterClose = closeFileAction(state, fromPane, file);
  const afterOpenAction = openFileAction(afterClose, toPane, file);
  return activateFileAction(afterOpenAction, toPane, file.path);
}
