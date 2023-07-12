import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useCallback } from 'react';

import { paneGroupAtom } from '../core/paneGroup';
import { PaneId } from '../types/PaneGroup';

/** Returns the count of open editors for a given pane */
export function useOpenEditorsCountForPane(paneId: PaneId) {
  return useAtomValue(
    selectAtom(
      paneGroupAtom,
      useCallback((paneGroup) => paneGroup[paneId].openEditorIds.length, [paneId]),
    ),
  );
}
