import { Atom, atom, Getter } from 'jotai';
import { loadable } from 'jotai/utils';
import { Loadable } from 'jotai/vanilla/utils/loadable';

import { readFileEntryAsBinary, readFileEntryAsText } from '../filesystem';
import { isNonNullish } from '../lib/isNonNullish';
import { FileContent } from '../types/FileContent';
import { FileEntry } from '../types/FileEntry';

/** *****************
 * File entries atoms
 ********************/
const fileEntriesAtom = atom<Map<FileId, FileEntry>>(new Map());

const addFileEntry = atom(null, (get, set, file: FileEntry) => {
  const updatedFileEntries = new Map(get(fileEntriesAtom));
  updatedFileEntries.set(file.path, file);
  set(fileEntriesAtom, updatedFileEntries);
});

const removeFileEntry = atom(null, (get, set, fileId: FileId) => {
  const updatedFileEntries = new Map(get(fileEntriesAtom));
  updatedFileEntries.delete(fileId);
  set(fileEntriesAtom, updatedFileEntries);
});

/** *****************
 * Pane related atoms
 ********************/

export type PaneId = 'LEFT' | 'RIGHT';
const DEFAULT_PANE: PaneId = 'LEFT';

interface PaneState {
  id: PaneId;
  openFiles: FileId[];
  activeFile?: FileId;
}

type PanesState = Record<PaneId, Omit<PaneState, 'id'>>;

const panesAtom = atom<PanesState>({
  LEFT: {
    openFiles: [],
  },
  RIGHT: {
    openFiles: [],
  },
});

const activePaneIdAtom = atom<PaneId>(DEFAULT_PANE);

const activePaneAtom = atom<PaneState>((get) => {
  const activePaneId = get(activePaneIdAtom);
  return { ...get(panesAtom)[activePaneId], id: activePaneId };
});

function getPane(get: Getter, paneId: PaneId) {
  const panes = get(panesAtom);
  const fileEntries = get(fileEntriesAtom);
  const openFiles = get(openFilesAtom);
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
const addFileToPane = atom(null, (get, set, { fileId, paneId }: SelectFilePayload) => {
  const panes = get(panesAtom);
  set(panesAtom, {
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
const removeFileFromPane = atom(null, (get, set, { fileId, paneId }: SelectFilePayload) => {
  const panes = get(panesAtom);
  const updatedOpenFiles = panes[paneId].openFiles.filter((_fileId) => _fileId !== fileId);
  set(panesAtom, {
    ...panes,
    [paneId]: {
      ...panes[paneId],
      openFiles: updatedOpenFiles,
    },
  });
  if (updatedOpenFiles.length > 0) {
    set(selectFileInPaneAtom, { fileId: updatedOpenFiles[updatedOpenFiles.length - 1], paneId });
  }
});

/** ***********************
 * Open files related atoms
 **************************/

export type FileId = string;

type OpenFilesState = Map<FileId, Atom<Loadable<Promise<FileContent>>>>;

const openFilesAtom = atom<OpenFilesState>(new Map());

interface SelectFilePayload {
  fileId: FileId;
  paneId: PaneId;
}

interface SplitFilePayload {
  fileId: FileId;
  fromPaneId: PaneId;
  toPaneId: PaneId;
}

/**
 * Load file content in memory and create an atom to store the content
 */
const loadFileInMemory = atom(null, (get, set, file: FileEntry & { isFile: true }) => {
  const currentOpenFiles = get(openFilesAtom);
  const updatedMap = new Map(currentOpenFiles);
  const fileAtom = loadable(
    atom(async () => {
      const fileContent = await getFileContent(file);
      return fileContent;
    }),
  );
  updatedMap.set(file.path, fileAtom);
  set(openFilesAtom, updatedMap);
});

/**
 * Unload file content from memory
 */
const unloadFileFromMemory = atom(null, (get, set, fileId: FileId) => {
  const currentOpenFiles = get(openFilesAtom);
  const updatedMap = new Map(currentOpenFiles);
  updatedMap.delete(fileId);
  set(openFilesAtom, updatedMap);
});

/**
 * Select a file in the given pane, the file must already be in the pane
 */
export const selectFileInPaneAtom = atom(null, (get, set, { fileId, paneId }: SelectFilePayload) => {
  const panes = get(panesAtom);
  if (!panes[paneId].openFiles.includes(fileId)) {
    console.warn('File not open in the given pane ', fileId, paneId);
    return;
  }

  set(activePaneIdAtom, paneId);
  set(panesAtom, {
    ...panes,
    [paneId]: {
      ...panes[paneId],
      activeFile: fileId,
    },
  });
});

/** **********************
 * Exported combined atoms
 *************************/

/**
 * Open a file in the active pane
 */
export const openFileAtom = atom(null, (get, set, file: FileEntry) => {
  if (file.isFolder) {
    console.warn('Cannot open directory ', file.path);
    return;
  }
  // Load file in memory
  const currentOpenFiles = get(openFilesAtom);
  if (!currentOpenFiles.has(file.path)) {
    set(loadFileInMemory, file);
  }

  // Add to file entries atom
  set(addFileEntry, file);

  // Add file to panes state
  const activePane = get(activePaneAtom);
  const fileId = file.path;
  if (!activePane.openFiles.includes(fileId)) {
    set(addFileToPane, { fileId, paneId: activePane.id });
  }

  // Select file in pane
  set(selectFileInPaneAtom, { fileId, paneId: activePane.id });
});

/**
 * Removes file from the given pane and unload content from memory if the file is not open in another pane
 */
export const closeFileFromPaneAtom = atom(null, (get, set, { fileId, paneId }: SelectFilePayload) => {
  const currentOpenFiles = get(openFilesAtom);
  if (!currentOpenFiles.has(fileId)) {
    console.warn('File is not open ', fileId);
    return;
  }
  const panes = get(panesAtom);
  if (!panes[paneId].openFiles.includes(fileId)) {
    console.warn('File is not open in the given pane ', fileId, paneId);
    return;
  }

  set(removeFileFromPane, { fileId, paneId });

  // Unload file from memory if the file is no longer open anywhere
  if (
    Object.entries(panes)
      .filter(([_paneId]) => _paneId !== paneId) // Keep only other panes
      .every(([, pane]) => !pane.openFiles.includes(fileId)) // Check that the file was not open in any other pane
  ) {
    set(removeFileEntry, fileId);
    set(unloadFileFromMemory, fileId);
  }
});

export const leftPaneAtom = atom((get) => getPane(get, 'LEFT'));
export const rightPaneAtom = atom((get) => getPane(get, 'RIGHT'));

export const splitFileToPaneAtom = atom(null, (_get, set, { fileId, fromPaneId, toPaneId }: SplitFilePayload) => {
  set(removeFileFromPane, { paneId: fromPaneId, fileId });
  set(addFileToPane, { paneId: toPaneId, fileId });
  set(selectFileInPaneAtom, { paneId: toPaneId, fileId });
});

async function getFileContent(file: FileEntry & { isFile: true }): Promise<FileContent> {
  switch (file.fileExtension) {
    case 'xml': {
      const textContent = await readFileEntryAsText(file);
      return { type: 'XML', textContent };
    }
    case 'json': {
      const textContent = await readFileEntryAsText(file);
      return { type: 'JSON', textContent };
    }
    case 'pdf': {
      const binaryContent = await readFileEntryAsBinary(file);
      return { type: 'PDF', binaryContent };
    }
    default: {
      const textContent = await readFileEntryAsText(file);
      return { type: 'TIPTAP', textContent };
    }
  }
}
