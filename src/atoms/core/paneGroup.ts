import { atom, Getter } from 'jotai';

import { isNonNullish } from '../../lib/isNonNullish';
import { PaneContent, PaneEditorId, PaneId, PaneState } from '../types/PaneGroup';
import { activePaneIdAtom } from './activePane';
import { editorsContentStateAtom } from './editorContent';
import { editorsDataAtom } from './editorData';

type PaneGroupState = Record<PaneId, PaneState>;

/** This atom contains data about the panes: the list of open editors and the active editor */
export const paneGroupAtom = atom<PaneGroupState>({
  LEFT: {
    openEditorIds: [],
  },
  RIGHT: {
    openEditorIds: [],
  },
});

export function getPane(get: Getter, paneId: PaneId): PaneContent {
  const panes = get(paneGroupAtom);
  const editorsData = get(editorsDataAtom);
  const openEditors = get(editorsContentStateAtom);
  const pane = panes[paneId];

  const editorContentAtoms = pane.activeEditorId && openEditors.get(pane.activeEditorId);

  if (pane.activeEditorId && !editorContentAtoms) {
    throw new Error('Editor content is not loaded in memory');
  }

  return {
    id: paneId,
    openEditors: pane.openEditorIds.map((id) => editorsData.get(id)).filter(isNonNullish),
    activeEditor: pane.activeEditorId ? { id: pane.activeEditorId, contentAtoms: editorContentAtoms! } : undefined,
  };
}

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
