import { atom } from 'jotai';

import { readFileContent } from '../../io/filesystem';
import { EditorContent } from '../types/EditorContent';
import { EditorContentAtoms } from '../types/EditorContentAtoms';
import { buildEditorId, EditorId } from '../types/EditorData';
import { FileFileEntry } from '../types/FileEntry';
import { createEditorContentAtoms } from './createEditorContentAtoms';

type EditorsContentState = ReadonlyMap<EditorId, EditorContentAtoms>;

/** This atom stores the atoms containing the content of open editors. */
export const editorsContentStateAtom = atom<EditorsContentState>(new Map());

/** Asynchronously loads file content in memory */
export const loadFileEntry = atom(null, (get, set, file: FileFileEntry) => {
  const currentOpenEditors = get(editorsContentStateAtom);
  const updatedMap = new Map(currentOpenEditors);

  const editorId = buildEditorId('text', file.path);
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
