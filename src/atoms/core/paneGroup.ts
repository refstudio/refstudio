import { atom } from 'jotai';

import { buildEditorIdFromPath, EditorId } from '../types/EditorData';
import { PaneEditorId, PaneGroupState, PaneId, PaneState } from '../types/PaneGroup';
import { activePaneIdAtom } from './activePane';
import { editorsContentStateAtom, updateEditorContentIdAtom } from './editorContent';
import { editorsDataAtom, renameEditorDataAtom } from './editorData';

/** This atom contains data about the panes: the list of open editors and the active editor */
export const paneGroupAtom = atom<PaneGroupState>({
  LEFT: {
    openEditorIds: [],
  },
  RIGHT: {
    openEditorIds: [],
  },
});

/** Updates a given pane with partial attributes */
export const updatePaneGroup = atom(
  null,
  (get, set, { paneId, ...update }: { paneId: PaneId } & Partial<PaneState>) => {
    const panes = get(paneGroupAtom);
    set(paneGroupAtom, {
      ...panes,
      [paneId]: {
        ...panes[paneId],
        ...update,
      },
    });
  },
);

/**
 * Adds an editor to the list of open editors of the given pane
 * Please note that this atom does not check that editor content is loaded in memory
 * */
export const addEditorToPane = atom(null, (get, set, { editorId, paneId }: PaneEditorId) => {
  const panes = get(paneGroupAtom);
  set(updatePaneGroup, {
    paneId,
    openEditorIds: panes[paneId].openEditorIds.includes(editorId)
      ? panes[paneId].openEditorIds // Editor was already open
      : [...panes[paneId].openEditorIds, editorId], // Add editor to the list of open editors
  });
});

/** Removes an editor from the list of open editors */
export const removeEditorFromPane = atom(null, (get, set, { editorId, paneId }: PaneEditorId) => {
  const panes = get(paneGroupAtom);

  if (!panes[paneId].openEditorIds.includes(editorId)) {
    console.warn('Editor is not open in the given pane ', editorId, paneId);
    return;
  }

  const updatedOpenEditors = panes[paneId].openEditorIds.filter((_editorId) => _editorId !== editorId);

  // If the active editor was the editor being removed, make the last editor of the pane the new active one
  let updatedActiveEditor = panes[paneId].activeEditorId;
  if (updatedActiveEditor === editorId) {
    updatedActiveEditor = updatedOpenEditors.length > 0 ? updatedOpenEditors[updatedOpenEditors.length - 1] : undefined;
    if (updatedOpenEditors.length === 0) {
      // If the pane becomes empty, focus the first remaining non-empty pane
      const nonEmptyPaneId = Object.keys(panes).find((_paneId) => panes[_paneId as PaneId].openEditorIds.length > 0) as
        | PaneId
        | undefined;
      if (nonEmptyPaneId) {
        set(activePaneIdAtom, nonEmptyPaneId);
      }
    }
  }

  set(updatePaneGroup, {
    paneId,
    openEditorIds: updatedOpenEditors,
    activeEditorId: updatedActiveEditor,
  });
});

/** Updates the active editor of the pane */
export const selectEditorInPaneAtom = atom(null, (get, set, { editorId, paneId }: PaneEditorId) => {
  const panes = get(paneGroupAtom);

  if (!panes[paneId].openEditorIds.includes(editorId)) {
    console.warn('Editor not open in the given pane ', editorId, paneId);
    return;
  }

  set(activePaneIdAtom, paneId);
  set(updatePaneGroup, {
    paneId,
    activeEditorId: editorId,
  });
});

interface RenameEditorInPanePayload extends PaneEditorId {
  newName: string;
  newPath: string;
}
export const renameEditorInPaneAtom = atom(
  null,
  (get, set, { editorId, paneId, newName, newPath }: RenameEditorInPanePayload) => {
    const panes = get(paneGroupAtom);

    /* c8 ignore next 4 */
    if (!panes[paneId].openEditorIds.includes(editorId)) {
      console.warn('Editor not open in the given pane ', editorId, paneId);
      return;
    }

    const newEditorId = buildEditorIdFromPath(newPath);

    // Update editor data
    const editorData = get(editorsDataAtom).get(editorId);
    if (editorData) {
      set(renameEditorDataAtom, { editorId, newEditorId, newName });
    }

    // Update editor content
    const editorsContentState = get(editorsContentStateAtom);
    const editorContent = editorsContentState.get(editorId);
    if (editorContent) {
      set(updateEditorContentIdAtom, { editorId, newEditorId });
    }

    // Replace the old editor with the new one, but keep the order of open editors unchanged
    const newOpenEditorIds = panes[paneId].openEditorIds.map((openEditorId) =>
      openEditorId === editorId ? newEditorId : openEditorId,
    );
    // Update the active editor id if needed
    const newActiveEditorId = panes[paneId].activeEditorId === editorId ? newEditorId : panes[paneId].activeEditorId;
    set(updatePaneGroup, { paneId, activeEditorId: newActiveEditorId, openEditorIds: newOpenEditorIds });
  },
);

export const renameEditorAtom = atom(
  null,
  (get, set, { editorId, newName, newPath }: { editorId: EditorId; newName: string; newPath: string }) => {
    const panes = get(paneGroupAtom);

    Object.keys(panes).forEach((paneId) => {
      if (panes[paneId as PaneId].openEditorIds.includes(editorId)) {
        set(renameEditorInPaneAtom, { editorId, paneId: paneId as PaneId, newName, newPath });
      }
    });
  },
);
