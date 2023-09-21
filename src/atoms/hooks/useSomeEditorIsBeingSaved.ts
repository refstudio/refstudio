import { useAtomValue } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { useCallback } from 'react';

import { editorsDataAtom } from '../core/editorData';

/** Returns true if any open editor is dirty */
export function useSomeEditorIsBeingSaved(): boolean {
  return useAtomValue(
    selectAtom(
      editorsDataAtom,
      useCallback((editorsData) => Array.from(editorsData.values()).some((editor) => editor.isContentBeingSaved), []),
    ),
  );
}
