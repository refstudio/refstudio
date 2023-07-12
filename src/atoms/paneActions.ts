import { atom } from 'jotai';

import { activePaneIdAtom } from './core/activePane';
import { PaneId } from './types/PaneGroup';

export const focusPaneAtom = atom(null, (_get, set, paneId: PaneId) => {
  set(activePaneIdAtom, paneId);
});
