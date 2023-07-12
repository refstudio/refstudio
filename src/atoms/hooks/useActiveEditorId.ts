import { useAtomValue } from 'jotai';

import { activePaneIdAtom } from '../core/activePane';
import { useActiveEditorIdForPane } from './useActiveEditorIdForPane';

export function useActiveEditorId() {
  const activePaneId = useAtomValue(activePaneIdAtom);

  return useActiveEditorIdForPane(activePaneId);
}
