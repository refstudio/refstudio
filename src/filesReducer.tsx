import { FileEntry } from '@tauri-apps/api/fs';

type FilesStatePane = 'LEFT' | 'RIGHT';

interface FilesStateEntry {
  file: FileEntry;
  pane: FilesStatePane;
  active: boolean;
}

export interface FilesState {
  openFiles: FilesStateEntry[];
}

type FilesActionType = 'OPEN_FILE' | 'CLOSE_FILE';
interface FilesActionBase {
  type: FilesActionType;
}
interface FilesActionOpen extends FilesActionBase {
  type: 'OPEN_FILE';
  payload: {
    file: FileEntry;
    pane: FilesStatePane;
  };
}
interface FilesActionClose extends FilesActionBase {
  type: 'CLOSE_FILE';
  payload: {
    file: FileEntry;
    pane: FilesStatePane;
  };
}
export type FilesAction = FilesActionOpen | FilesActionClose;

function findEntry(path: string, pane: FilesStatePane, entries: FilesStateEntry[]) {
  return entries.find((entry) => entry.pane === pane && entry.file.path === path);
}

export function filesReducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    // Open, and activate, file
    case 'OPEN_FILE': {
      const { file, pane } = action.payload;
      return {
        ...state,
        openFiles: [
          ...state.openFiles
            // reset all active, for selected pane
            .map((e) => ({ ...e, active: e.pane === pane ? false : e.active }))
            // activate file, if exists, for selected pane
            .map((e) => ({ ...e, active: e.pane === pane && e.file.path === file.path ? true : e.active })),
          // Append if needed
          ...(findEntry(file.path, pane, state.openFiles)
            ? [] // entry exists!
            : [{ file, active: true, pane }]), // add new entry (make active)
        ],
      };
    }

    // Close file, and active another in the same panel
    case 'CLOSE_FILE': {
      const { file, pane } = action.payload;
      const entryToClose = findEntry(file.path, pane, state.openFiles);
      if (!entryToClose) {
        return state; // File not found open! No change.
      }

      const filteredOpenFiles = state.openFiles.filter((e) => !(e.pane === pane && e.file.path === file.path));
      const firstPaneEntry = state.openFiles.find((e) => e.pane === pane);
      const newOpenFiles =
        entryToClose.active && firstPaneEntry
          ? filteredOpenFiles // need to active one file
              .map((e) => (e === firstPaneEntry ? { ...e, active: true } : e))
          : filteredOpenFiles; // no change (file wasn't active)

      return {
        ...state,
        openFiles: newOpenFiles,
      };
    }

    default:
      return state;
  }
}
export function defaultFilesState(): FilesState {
  return {
    openFiles: [],
  };
}
