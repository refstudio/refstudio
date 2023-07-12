import { useAtomValue } from 'jotai';

import { activePaneIdAtom } from '../core/activePane';
import { EditorContentAtoms } from '../types/EditorContentAtoms';
import { useActiveEditorContentAtomsForPane } from './useActiveEditorContentAtomsForPane';

/** Returns the the content of the active editor of the given pane */
export function useActiveEditorContentAtoms(): EditorContentAtoms | null {
  const activePaneId = useAtomValue(activePaneIdAtom);

  return useActiveEditorContentAtomsForPane(activePaneId);
}
