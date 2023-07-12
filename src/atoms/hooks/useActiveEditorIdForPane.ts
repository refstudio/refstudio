import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useCallback } from 'react';

import { paneGroupAtom } from '../core/paneGroup';
import { EditorId } from '../types/EditorData';
import { PaneId } from '../types/PaneGroup';

/** Return the editor id of the active editor in the given pane, or null if the pane has no active editor */
export function useActiveEditorIdForPane(paneId: PaneId): EditorId | null {
  return useAtomValue(
    selectAtom(
      paneGroupAtom,
      useCallback((paneGroup) => paneGroup[paneId].activeEditorId ?? null, [paneId]),
    ),
  );
}
