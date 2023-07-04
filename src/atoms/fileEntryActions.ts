import { exists } from '@tauri-apps/api/fs';
import { atom } from 'jotai';

import { deleteFile, getBaseDir } from '../io/filesystem';
import { editorsContentStateAtom, loadEditorContent, loadFileEntry } from './core/editorContent';
import { addEditorData, editorsDataAtom, setEditorDataIsDirtyAtom } from './core/editorData';
import { addEditorToPane, selectEditorInPaneAtom } from './core/paneGroup';
import { closeEditorFromAllPanesAtom, targetPaneIdFor } from './editorActions';
import { getFileExplorerEntryFromPathAtom, refreshFileTreeAtom } from './fileExplorerActions';
import { buildEditorIdFromPath } from './types/EditorData';
import { FileEntry, getFileFileEntryFromPath } from './types/FileEntry';
import { PaneId } from './types/PaneGroup';

/** Open a file in a pane (depending on the file extension) */
export const openFileEntryAtom = atom(null, (get, set, file: FileEntry) => {
  if (file.isFolder) {
    console.warn('Cannot open directory ', file.path);
    return;
  }

  const editorId = buildEditorIdFromPath(file.path);
  // Load file in memory
  const currentOpenEditors = get(editorsContentStateAtom);
  if (!currentOpenEditors.has(editorId)) {
    set(loadFileEntry, file);
  }

  // Add to editor entries atom
  set(addEditorData, { id: editorId, title: file.name });

  // Add editor to panes state
  const targetPaneId = targetPaneIdFor(file);
  set(addEditorToPane, { editorId, paneId: targetPaneId });

  // Select editor in pane
  set(selectEditorInPaneAtom, { editorId, paneId: targetPaneId });
});

export const openFilePathAtom = atom(null, (get, set, filePath: string) => {
  const fileEntry = getFileFileEntryFromPath(filePath);
  set(openFileEntryAtom, fileEntry);
});

/** Create a new file and open it in the LEFT pane */
export const createFileAtom = atom(null, async (get, set) => {
  const openEditorNames = [...get(editorsDataAtom).values()].map(({ title }) => title);
  const fileName = await generateFileName(openEditorNames);
  const filePath = `${await getBaseDir()}/${fileName}`;
  const editorId = buildEditorIdFromPath(filePath);

  // Load editor in memory
  set(loadEditorContent, { editorId, editorContent: { type: 'text', textContent: '<p></p>' } });

  // Add to editor entries atom
  set(addEditorData, { id: editorId, title: fileName });
  set(setEditorDataIsDirtyAtom, { editorId, isDirty: true });

  // Add editor to panes state
  const paneId: PaneId = 'LEFT';
  set(addEditorToPane, { editorId, paneId });

  // Select editor in pane
  set(selectEditorInPaneAtom, { editorId, paneId });
});

async function generateFileName(openEditorNames: string[]) {
  const nameFromIndex = (index: number) => `Untitled-${index}`;
  let i = 1;
  while (!(await isValidName(nameFromIndex(i), openEditorNames))) {
    i++;
  }
  return nameFromIndex(i);
}

async function isValidName(name: string, openEditorNames: string[]) {
  return !openEditorNames.includes(name) && !(await exists(`${await getBaseDir()}/${name}`));
}

export const deleteFileAtom = atom(null, async (get, set, filePath: string) => {
  const fileExplorerEntry = get(getFileExplorerEntryFromPathAtom(filePath));

  if (!fileExplorerEntry) {
    throw new Error(`File or folder does not exist: ${filePath}`);
  }

  if (fileExplorerEntry.isFolder) {
    throw new Error(`Delete folders is not supported: ${filePath}`);
  }

  // Remove file from disk
  const success = await deleteFile(filePath);
  if (!success) {
    return;
  }

  // Remove file from open editors
  const editorId = buildEditorIdFromPath(filePath);
  set(closeEditorFromAllPanesAtom, editorId);

  // Refresh file explorer
  await set(refreshFileTreeAtom);
});
