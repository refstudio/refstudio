import { Atom, atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { getSeparator, newProject, openProject, sampleProject, setCurrentProjectId } from '../io/filesystem';
import { closeAllEditorsAtom } from './editorActions';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { clearAllReferencesAtom, loadReferencesAtom } from './referencesState';

// #####################################################################################
// Internal Atoms
// #####################################################################################
const currentProjectPathAtom = atom('');
const currentProjectIdAtom = atom('');

// #####################################################################################
// Public API
// #####################################################################################
export const isProjectOpenAtom = atom((get) => get(currentProjectPathAtom) !== '');
export const projectPathAtom: Atom<string> = currentProjectPathAtom;
export const projectIdAtom: Atom<string> = currentProjectIdAtom;
export const projectNameAtom = selectAtom(currentProjectPathAtom, extractProjectName);

export const openProjectAtom = atom(null, async (_, set, path: string) => {
  if (!path) {
    return;
  }

  // Close current project before create new
  await set(closeProjectAtom);

  set(currentProjectPathAtom, path);
  await openProject(path);
  await set(loadReferencesAtom);
  await set(refreshFileTreeAtom);
});

export const newProjectAtom = atom(null, async (_, set, path: string) => {
  if (!path) {
    return;
  }
  // Close current project before create new
  await set(closeProjectAtom);

  // Create empty project
  set(currentProjectPathAtom, path);
  await newProject(path);
  await set(loadReferencesAtom);
  await set(refreshFileTreeAtom);
});

export const newSampleProjectAtom = atom(null, async (_, set, path: string) => {
  if (!path) {
    return;
  }
  // Close current project before create new
  await set(closeProjectAtom);

  // Create empty project
  set(currentProjectPathAtom, path);
  await sampleProject(path);
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

// -------------
// Web
// -------------
export const newWebProjectAtom = atom(null, async (_, set, projectId: string, path: string) => {
  // Close current project before create new
  await set(closeProjectAtom);

  // Create empty project
  setCurrentProjectId(projectId);
  set(currentProjectIdAtom, projectId);
  set(currentProjectPathAtom, path);

  await set(loadReferencesAtom);
  await set(refreshFileTreeAtom);
});

export const openWebProjectAtom = atom(null, async (_, set, projectId: string, path: string) => {
  // Close current project before create new
  await set(closeProjectAtom);

  // Create empty project
  setCurrentProjectId(projectId);
  set(currentProjectIdAtom, projectId);
  set(currentProjectPathAtom, path);
  await set(loadReferencesAtom);
  await set(refreshFileTreeAtom);
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
