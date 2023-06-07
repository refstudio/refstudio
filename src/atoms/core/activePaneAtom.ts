/* eslint-disable no-underscore-dangle */
import { atom } from 'jotai';

import { PaneId } from './atom.types';
import { _paneGroupAtom, DEFAULT_PANE, PaneState } from './paneGroupAtom';

export const _activePaneIdAtom = atom<PaneId>(DEFAULT_PANE);

export const _activePaneAtom = atom<PaneState & { id: PaneId }>((get) => {
  const activePaneId = get(_activePaneIdAtom);
  return { ...get(_paneGroupAtom)[activePaneId], id: activePaneId };
});
