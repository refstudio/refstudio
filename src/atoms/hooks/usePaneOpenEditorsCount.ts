import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useMemo } from 'react';

import { paneGroupAtom } from '../core/paneGroup';
import { PaneId } from '../types/PaneGroup';

/** Returns the count of open editors for a given pane */
export function usePaneOpenEditorsCount(paneId: PaneId) {
  const editorsCountAtom = useMemo(
    () => selectAtom(paneGroupAtom, (paneGroup) => paneGroup[paneId].openEditorIds.length),
    [paneId],
  );
  return useAtomValue(editorsCountAtom);
}
