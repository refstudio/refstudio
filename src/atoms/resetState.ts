import { atom } from 'jotai';

import { chatThreadAtom } from './chatState';
import { closeAllEditorsAtom } from './editorActions';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { clearAllReferencesAtom } from './referencesState';
import { selectionAtom } from './selectionState';

/**
 * Reset RefStudio to initial state.
 * This should be used wne the user closes the project.
 */
export const resetStateAtom = atom(null, async (_, set) => {
  set(closeAllEditorsAtom);
  set(clearAllReferencesAtom);
  set(selectionAtom, '');
  set(chatThreadAtom, []);
  await set(refreshFileTreeAtom);
});
