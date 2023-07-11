import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useMemo } from 'react';

import { paneGroupAtom } from '../core/paneGroup';
import { EditorId } from '../types/EditorData';
import { PaneId } from '../types/PaneGroup';

/** Return the editor id of the active editor in the given pane, or null if the pane has no active editor */
export function usePaneActiveEditorId(paneId: PaneId): EditorId | null {
  const activeEditorIdsAtom = useMemo(
    () => selectAtom(paneGroupAtom, (paneGroup) => paneGroup[paneId].activeEditorId ?? null),
    [paneId],
  );

  return useAtomValue(activeEditorIdsAtom);
}
