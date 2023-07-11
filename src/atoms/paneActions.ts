import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { activePaneIdAtom } from './core/activePane';
import { paneGroupAtom } from './core/paneGroup';
import { PaneId } from './types/PaneGroup';

export const focusPaneAtom = atom(null, (_get, set, paneId: PaneId) => {
  set(activePaneIdAtom, paneId);
});

/** Return the active editor id of the active pane */
export const activeEditorIdAtom = atom((get) => {
  const activePaneId = get(activePaneIdAtom);
  return get(selectAtom(paneGroupAtom, (paneGroup) => paneGroup[activePaneId].activeEditorId ?? null));
});
