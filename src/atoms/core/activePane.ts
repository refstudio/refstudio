import { atom } from 'jotai';

import { PaneId, PaneState } from '../types/PaneGroup';
import { paneGroupAtom } from './paneGroup';

const DEFAULT_PANE: PaneId = 'LEFT';

/** This core atom contains the id of the currently active pane. */
export const activePaneIdAtom = atom<PaneId>(DEFAULT_PANE);

/** Read-only composed atom to get the active pane along with its id. */
export const activePaneAtom = atom<PaneState & { id: PaneId }>((get) => {
  const activePaneId = get(activePaneIdAtom);
  return { ...get(paneGroupAtom)[activePaneId], id: activePaneId };
});
