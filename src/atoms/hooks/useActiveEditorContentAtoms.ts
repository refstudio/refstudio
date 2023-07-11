import { useAtomValue } from 'jotai';

import { activePaneIdAtom } from '../core/activePane';
import { EditorContentAtoms } from '../types/EditorContentAtoms';
import { usePaneActiveEditorContentAtoms } from './usePaneActiveEditorContentAtoms';

/** Returns the the content of the active editor of the given pane */
export function useActiveEditorContentAtoms(): EditorContentAtoms | null {
  const activePaneId = useAtomValue(activePaneIdAtom);

  return usePaneActiveEditorContentAtoms(activePaneId);
}
