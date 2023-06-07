/* eslint-disable no-underscore-dangle */
import { atom } from 'jotai';

import { PaneId, PaneState } from './atom.types';
import { _paneGroupAtom } from './paneGroupAtom';

const DEFAULT_PANE: PaneId = 'LEFT';

export const _activePaneIdAtom = atom<PaneId>(DEFAULT_PANE);

export const _activePaneAtom = atom<PaneState & { id: PaneId }>((get) => {
  const activePaneId = get(_activePaneIdAtom);
  return { ...get(_paneGroupAtom)[activePaneId], id: activePaneId };
});
