import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileEntry } from '@tauri-apps/api/fs';

type FileEntryType = 'TipTap' | 'PDF' | 'Unknown';

export interface FileEntryInfo {
  entry: FileEntry;
  type: FileEntryType;
  isDirectory: boolean;
}

export interface OpenedFilesState {
  selectedFile?: FileEntryInfo;
  files: FileEntryInfo[];
}

const initialState: OpenedFilesState = {
  selectedFile: undefined,
  files: [],
};

export const openedFilesSlice = createSlice({
  name: 'openedFiles',
  initialState,

  reducers: {
    openFile: (state, action: PayloadAction<FileEntryInfo>) => {
      const exists = state.files.find(sameFileAs(action.payload));
      if (!exists) {
        state.files.push(action.payload);
      }
      state.selectedFile = state.files.find(sameFileAs(action.payload));
    },

    selectFile: (state, action: PayloadAction<FileEntryInfo>) => {
      state.selectedFile = state.files.find(sameFileAs(action.payload));
    },

    closeFile: (state, action: PayloadAction<FileEntryInfo>) => {
      state.files = state.files.filter((e) => e.entry.path !== action.payload.entry.path);
      if (sameFile(state.selectedFile, action.payload)) {
        state.selectedFile = state.files[0];
      }
    },
  },
});

export const { openFile, selectFile, closeFile } = openedFilesSlice.actions;

export default openedFilesSlice.reducer;

function sameFile(a?: FileEntryInfo, b?: FileEntryInfo) {
  if (!a || !b) return false;
  return a.entry.path === b.entry.path;
}

function sameFileAs(a?: FileEntryInfo) {
  return (b?: FileEntryInfo) => sameFile(a, b);
}
