import { useAtomValue } from 'jotai';

import { activePaneIdAtom } from '../core/activePane';

export function useActivePaneId() {
  return useAtomValue(activePaneIdAtom);
}
