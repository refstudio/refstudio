import { Atom, atom } from 'jotai';

import { getSeparator, openProject } from '../io/filesystem';
import { closeAllEditorsAtom } from './editorActions';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { clearAllReferencesAtom, loadReferencesAtom } from './referencesState';

// #####################################################################################
// Internal Atoms
// #####################################################################################
const currentProjectPathAtom = atom('');
const currentProjectNameAtom = atom('');

// #####################################################################################
// Public API
// #####################################################################################
export const isProjectOpenAtom = atom((get) => get(currentProjectPathAtom) !== '');
export const projectPathAtom: Atom<string> = currentProjectPathAtom;
export const projectNameAtom: Atom<string> = currentProjectNameAtom;

export const openProjectAtom = atom(null, async (_, set, path: string) => {
  if (!path) {
    return;
  }

  set(currentProjectNameAtom, extractProjectName(path));
  set(currentProjectPathAtom, path);
  await openProject(path);
  await set(loadReferencesAtom);
});

export const newProjectAtom = atom(null, async (_, set, path: string) => {
  if (!path) {
    return;
  }
  set(currentProjectNameAtom, extractProjectName(path));
  set(currentProjectPathAtom, path);
  await openProject(path, true);
  await set(loadReferencesAtom);
  await set(refreshFileTreeAtom);
});

export const closeProjectAtom = atom(null, async (get, set) => {
  const isOpen = get(isProjectOpenAtom);
  if (isOpen) {
    set(closeAllEditorsAtom);
    set(clearAllReferencesAtom);
    set(currentProjectPathAtom, '');
    await set(refreshFileTreeAtom);
  }
});

// #####################################################################################
// Utilities
// #####################################################################################
function extractProjectName(projectPath: string) {
  const segments = projectPath.split(getSeparator());
  if (segments.length > 1) {
    return segments.pop()!.toUpperCase().replace(/-\./g, ' ');
  }
  return '';
}
