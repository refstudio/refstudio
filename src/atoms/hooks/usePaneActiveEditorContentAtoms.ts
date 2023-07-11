import { atom, useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useMemo } from 'react';

import { editorsContentStateAtom } from '../core/editorContent';
import { EditorContentAtoms } from '../types/EditorContentAtoms';
import { PaneId } from '../types/PaneGroup';
import { usePaneActiveEditorId } from './usePaneActiveEditorId';

/** Returns the the content of the active editor of the given pane */
export function usePaneActiveEditorContentAtoms(paneId: PaneId): EditorContentAtoms | null {
  const activeEditorId = usePaneActiveEditorId(paneId);

  const activeEditorContentAtom = useMemo(() => {
    if (!activeEditorId) {
      return atom(null);
    }
    return selectAtom(editorsContentStateAtom, (editorsContentState) => {
      const contentAtoms = editorsContentState.get(activeEditorId);
      if (!contentAtoms) {
        console.error('Editor content is not loaded in memory: ', activeEditorId);
        return null;
      }
      return contentAtoms;
    });
  }, [activeEditorId]);

  return useAtomValue(activeEditorContentAtom);
}
