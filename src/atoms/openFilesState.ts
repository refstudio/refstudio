import { FileEntry } from '@tauri-apps/api/fs';
import { atom } from 'jotai';

export type PaneId = 'LEFT' | 'RIGHT';
type FileId = string;

interface OpenFilesState {
  files: Record<FileId, FileEntry | undefined>; // We need undefined bc of the lookup
  panes: Record<PaneId, PaneState>; // We know we will only have values (not undefined)
}

export interface PaneState {
  id: PaneId;
  openFiles: Set<FileId>;
  activeFile?: FileId;
}

export const openFilesAtom = atom<OpenFilesState>({
  files: {},
  panes: {
    LEFT: {
      id: 'LEFT',
      openFiles: new Set<FileId>(),
      activeFile: undefined,
    },
    RIGHT: {
      id: 'RIGHT',
      openFiles: new Set<FileId>(),
      activeFile: undefined,
    },
  },
});

export const leftPaneAtom = atom((get) => {
  const paneId: PaneId = 'LEFT';
  const { files } = get(openFilesAtom);
  const pane = get(openFilesAtom).panes[paneId];

  return {
    files: Array.from(pane.openFiles)
      .map((id) => files[id])
      .filter((f) => f) as FileEntry[], // Ensure non-null
    active: pane.activeFile ? files[pane.activeFile] : undefined,
  };
});

export const rightPaneAtom = atom((get) => {
  const paneId: PaneId = 'RIGHT';
  const { files } = get(openFilesAtom);
  const pane = get(openFilesAtom).panes[paneId];

  return {
    files: Array.from(pane.openFiles)
      .map((id) => files[id])
      .filter((f) => f) as FileEntry[], // Ensure non-null
    active: pane.activeFile ? files[pane.activeFile] : undefined,
  };
});

export function openFileAction(state: OpenFilesState, pane: PaneId, file: FileEntry) {
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
        openFiles: state.panes[pane].openFiles.add(file.path), // Add new file
        activeFile: file.path, // Make file active
      },
    },
  };
  return newState;
}

export function activateFileAction(state: OpenFilesState, pane: PaneId, file: FileEntry) {
  return {
    ...state,
    panes: {
      ...state.panes,
      [pane]: {
        ...state.panes[pane],
        activeFile: file.path,
      },
    },
  };
}

export function closeFileAction(state: OpenFilesState, pane: PaneId, file: FileEntry) {
  const newState = {
    ...state,
  };
  const panesPane = newState.panes[pane];
  panesPane.openFiles.delete(file.path);
  if (panesPane.activeFile === file.path) {
    panesPane.activeFile = [...panesPane.openFiles][0];
  }
  return newState;
}
