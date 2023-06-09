/* eslint-disable no-underscore-dangle */
import { atom } from 'jotai';

import { PaneId, PaneState } from '../types/PaneGroup';
import { _paneGroupAtom } from './paneGroup';

const DEFAULT_PANE: PaneId = 'LEFT';

/** This core atom contains the id of the currently active pane. */
export const _activePaneIdAtom = atom<PaneId>(DEFAULT_PANE);

/** Read-only composed atom to get the active pane along with its id. */
export const _activePaneAtom = atom<PaneState & { id: PaneId }>((get) => {
  const activePaneId = get(_activePaneIdAtom);
  return { ...get(_paneGroupAtom)[activePaneId], id: activePaneId };
});
