import { atom } from 'jotai';

import { editorsContentStateAtom, loadEditorContent, loadFileEntry } from './core/editorContent';
import { addEditorData, editorsDataAtom, setEditorDataIsDirtyAtom } from './core/editorData';
import { fileExplorerEntriesAtom } from './core/fileExplorerEntry';
import { addEditorToPane, selectEditorInPaneAtom } from './core/paneGroup';
import { targetPaneIdFor } from './editorActions';
import { buildEditorId } from './types/EditorData';
import { FileEntry, FileFileEntry } from './types/FileEntry';
import { PaneId } from './types/PaneGroup';

/** Open a file in a pane (depending on the file extension) */
export const openFileEntryAtom = atom(null, (get, set, file: FileEntry) => {
  if (file.isFolder) {
    console.warn('Cannot open directory ', file.path);
    return;
  }

  const editorId = buildEditorId('text', file.path);
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
  const fileEntry: FileFileEntry = {
    path: filePath,
    name: filePath.split('/').pop() ?? '',
    fileExtension: filePath.split('.').pop() ?? '',
    isDotfile: false,
    isFile: true,
    isFolder: false,
  };
  set(openFileEntryAtom, fileEntry);
});

/** Create a new file in the root of the project directory and open it in the LEFT pane */
export const createFileAtom = atom(null, (get, set) => {
  const fileExplorerEntries = get(fileExplorerEntriesAtom);
  const rootFileNames = get(fileExplorerEntries.childrenAtom).map(({ name }) => name);
  const openEditorNames = [...get(editorsDataAtom).values()].map(({ title }) => title);

  const fileName = generateFileName(new Set([...rootFileNames, ...openEditorNames]));
  const filePath = `/${fileName}`;
  const editorId = buildEditorId('text', filePath);

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

function generateFileName(existingFileNames: Set<string>) {
  const nameFromIndex = (index: number) => `Untitled-${index}`;
  let i = 1;
  while (existingFileNames.has(nameFromIndex(i))) {
    i++;
  }
  return nameFromIndex(i);
}
