import { atom } from 'jotai';

import { EditorData, EditorId } from '../types/EditorData';

/** This atom contains data about open editors */
export const editorsDataAtom = atom<Map<EditorId, EditorData>>(new Map());

/** Stores data for an editor when opening it */
export const addEditorData = atom(null, (get, set, editor: EditorData) => {
  const updatedEditorsData = new Map(get(editorsDataAtom));
  updatedEditorsData.set(editor.id, editor);
  set(editorsDataAtom, updatedEditorsData);
});

/** Removes data from memory */
export const removeEditorData = atom(null, (get, set, editorId: EditorId) => {
  const updatedEditorsData = new Map(get(editorsDataAtom));

  if (!updatedEditorsData.has(editorId)) {
    console.warn('Editor is not open ', editorId);
    return;
  }

  updatedEditorsData.delete(editorId);
  set(editorsDataAtom, updatedEditorsData);
});

/** Updated the `isDirty` flag of the given editor */
export const setEditorDataIsDirtyAtom = atom(
  null,
  (get, set, { editorId, isDirty }: { editorId: EditorId; isDirty: boolean }) => {
    const updatedEditorsData = new Map(get(editorsDataAtom));

    const editorData = updatedEditorsData.get(editorId);

    if (!editorData) {
      console.warn('Editor is not open ', editorId);
      return;
    }

    updatedEditorsData.set(editorId, { ...editorData, isDirty });
    set(editorsDataAtom, updatedEditorsData);
  },
);
