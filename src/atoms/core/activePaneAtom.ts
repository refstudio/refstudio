/* eslint-disable no-underscore-dangle */
import { atom } from 'jotai';

import { PaneId, PaneState } from './atom.types';
import { _paneGroupAtom } from './paneGroupAtom';

const DEFAULT_PANE: PaneId = 'LEFT';

/**
 * This core atom contains the id of the currently active pane.
 * A read-only combined atom enables getting the active pane along with its id.
 *
 * NOTE: This is a core atom file and it should never been used outside of the `atoms` directory of this project
 */
export const _activePaneIdAtom = atom<PaneId>(DEFAULT_PANE);

export const _activePaneAtom = atom<PaneState & { id: PaneId }>((get) => {
  const activePaneId = get(_activePaneIdAtom);
  return { ...get(_paneGroupAtom)[activePaneId], id: activePaneId };
});
