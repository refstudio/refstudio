import { atom } from 'jotai';

import { readFileContent } from '../../io/filesystem';
import { EditorContent } from '../types/EditorContent';
import { EditorContentAtoms } from '../types/EditorContentAtoms';
import { buildEditorIdFromPath, EditorId } from '../types/EditorData';
import { FileFileEntry } from '../types/FileEntry';
import { createEditorContentAtoms } from './createEditorContentAtoms';

type EditorsContentState = ReadonlyMap<EditorId, EditorContentAtoms>;

/** This atom stores the atoms containing the content of open editors. */
export const editorsContentStateAtom = atom<EditorsContentState>(new Map());

/** Asynchronously loads file content in memory */
export const loadFileEntry = atom(null, (get, set, file: FileFileEntry) => {
  const currentOpenEditors = get(editorsContentStateAtom);
  const updatedMap = new Map(currentOpenEditors);

  const editorId = buildEditorIdFromPath(file.path);
  updatedMap.set(editorId, createEditorContentAtoms(editorId, readFileContent(file)));
  set(editorsContentStateAtom, updatedMap);
});

/** Loads editor content in memory */
export const loadEditorContent = atom(
  null,
  (get, set, { editorId, editorContent }: { editorId: EditorId; editorContent: EditorContent }) => {
    const currentOpenEditors = get(editorsContentStateAtom);
    const updatedMap = new Map(currentOpenEditors);

    updatedMap.set(editorId, createEditorContentAtoms(editorId, editorContent));
    set(editorsContentStateAtom, updatedMap);
  },
);

/** Removes the editor content from memory */
export const unloadEditorContent = atom(null, (get, set, editorId: EditorId) => {
  const currentOpenEditors = get(editorsContentStateAtom);

  if (!currentOpenEditors.has(editorId)) {
    console.warn('Editor is not open ', editorId);
    return;
  }

  const updatedMap = new Map(currentOpenEditors);
  updatedMap.delete(editorId);
  set(editorsContentStateAtom, updatedMap);
});

interface UpdateEditorIdPayload {
  editorId: EditorId;
  newEditorId: EditorId;
}
export const updateEditorContentIdAtom = atom(null, (get, set, { editorId, newEditorId }: UpdateEditorIdPayload) => {
  const editorsContentState = get(editorsContentStateAtom);
  const editorContent = editorsContentState.get(editorId);
  /* c8 ignore next 4 */
  if (!editorContent) {
    console.warn('Trying to update the id of editor content that is not loaded', editorId);
    return;
  }

  // Update the editorId atom
  set(editorContent.editorIdAtom, newEditorId);

  // Update the map to move the entry from `[editorId]` to `[newEditorId]`
  const updatedEditorsContentState = new Map(get(editorsContentStateAtom));
  updatedEditorsContentState.set(newEditorId, updatedEditorsContentState.get(editorId)!);
  updatedEditorsContentState.delete(editorId);
  set(editorsContentStateAtom, updatedEditorsContentState);
});
