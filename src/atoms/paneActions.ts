import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { activePaneIdAtom } from './core/activePane';
import { getPane } from './core/paneGroup';
import { PaneId } from './types/PaneGroup';

export const leftPaneAtom = atom((get) => getPane(get, 'LEFT'));
export const rightPaneAtom = atom((get) => getPane(get, 'RIGHT'));
/** Returns the content of the active pane */

export const activePaneContentAtom = atom((get) => {
  const activePaneId = get(activePaneIdAtom);
  return getPane(get, activePaneId);
});

export const focusPaneAtom = atom(null, (_get, set, paneId: PaneId) => {
  set(activePaneIdAtom, paneId);
});

export const activeEditorAtom = selectAtom(
  activePaneContentAtom,
  (activePaneContent) => activePaneContent.activeEditor ?? null,
);

export const activeEditorIdAtom = selectAtom(activeEditorAtom, (editor) => editor?.id ?? null);
