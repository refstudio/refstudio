import { FileEntry } from '@tauri-apps/api/fs';
import { atom, Getter } from 'jotai';

import { isNonNullish } from '../lib/isNonNullish';

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
    },
    RIGHT: {
      id: 'RIGHT',
      openFiles: [],
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
    files: pane.openFiles.map((id) => files[id]).filter(isNonNullish),
    active: pane.activeFile ? files[pane.activeFile] : undefined,
  };
}

export const openFileInPaneAtom = atom(null, (get, set, update: { pane: PaneId; file: FileEntry }) => {
  const { pane, file } = update;

  const state = get(openFilesAtom);
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

  set(openFilesAtom, newState);
});

export const activateFileInPaneAtom = atom(null, (get, set, update: { pane: PaneId; path: string }) => {
  const { pane, path } = update;

  const state = get(openFilesAtom);
  const isFileOpenInPane = state.panes[pane].openFiles.includes(path);
  if (!isFileOpenInPane) {
    console.warn('Cannot find the file ', path);
    return;
  }

  const newState = {
    ...state,
    panes: {
      ...state.panes,
      [pane]: {
        ...state.panes[pane],
        activeFile: path,
      },
    },
  };
  set(openFilesAtom, newState);
});

export const closeFileInPaneAtom = atom(null, (get, set, update: { pane: PaneId; path: string }) => {
  const { pane, path } = update;

  const state = get(openFilesAtom);
  const file = state.files[path] as FileEntry | undefined;
  if (file === undefined) {
    console.warn('Cannot find the file ', path);
    return;
  } else {
    const newState = {
      ...state,
    };
    const panesPane = newState.panes[pane];
    panesPane.openFiles = panesPane.openFiles.filter((f) => f !== file.path);
    if (panesPane.activeFile === file.path) {
      panesPane.activeFile = [...panesPane.openFiles][0];
    }
    set(openFilesAtom, newState);
  }
});

export const splitFileToPaneAtom = atom(
  null,
  (_, set, update: { fromPane: PaneId; toPane: PaneId; file: FileEntry }) => {
    const { fromPane, toPane, file } = update;
    set(closeFileInPaneAtom, { pane: fromPane, path: file.path });
    set(openFileInPaneAtom, { pane: toPane, file });
    set(activateFileInPaneAtom, { pane: toPane, path: file.path });
  },
);
