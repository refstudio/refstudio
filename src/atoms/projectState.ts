import { Atom, atom } from 'jotai';

import { ensureSampleProjectFiles, setCurrentFileSystemProjectId } from '../io/filesystem';
import { createModalAtoms } from './core/createModalAtoms';
import { closeAllEditorsAtom } from './editorActions';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { clearAllReferencesAtom, loadReferencesAtom } from './referencesState';

// #####################################################################################
// Internal Atoms
// #####################################################################################
const currentProjectPathAtom = atom('');
const currentProjectNameAtom = atom('');
const currentProjectIdAtom = atom('');

// #####################################################################################
// Public API
// #####################################################################################
export const isProjectOpenAtom = atom((get) => get(currentProjectPathAtom) !== '');
export const projectPathAtom: Atom<string> = currentProjectPathAtom;
export const projectNameAtom: Atom<string> = currentProjectNameAtom;
export const projectIdAtom: Atom<string> = currentProjectIdAtom;

export const createProjectModalAtoms = createModalAtoms<string>();

export const newProjectAtom = atom(null, async (_, set, projectId: string, path: string, name: string) => {
  // Close current project before create new
  await set(closeProjectAtom);

  // Create empty project
  setCurrentFileSystemProjectId(projectId);
  set(currentProjectIdAtom, projectId);
  set(currentProjectPathAtom, path);
  set(currentProjectNameAtom, name);

  await set(loadReferencesAtom, projectId);
  await set(refreshFileTreeAtom);
});

export const openProjectAtom = atom(null, async (_, set, projectId: string, path: string, name: string) => {
  // Close current project before create new
  await set(closeProjectAtom);

  // Create empty project
  setCurrentFileSystemProjectId(projectId);
  set(currentProjectIdAtom, projectId);
  set(currentProjectPathAtom, path);
  set(currentProjectNameAtom, name);

  await set(loadReferencesAtom, projectId);
  await set(refreshFileTreeAtom);
});

export const closeProjectAtom = atom(null, async (get, set) => {
  const isOpen = get(isProjectOpenAtom);
  if (isOpen) {
    setCurrentFileSystemProjectId('');
    set(currentProjectIdAtom, '');
    set(currentProjectPathAtom, '');
    set(currentProjectNameAtom, '');

    set(closeAllEditorsAtom);
    set(clearAllReferencesAtom);
    await set(refreshFileTreeAtom);
  }
});

export const newSampleProjectAtom = atom(
  null,
  async (_, set, projectId: string, projectName: string, projectPath: string) => {
    // Close current project before create new
    await set(closeProjectAtom);

    // Open sample project
    setCurrentFileSystemProjectId(projectId);
    set(currentProjectIdAtom, projectId);
    set(currentProjectPathAtom, projectPath);
    set(currentProjectNameAtom, projectName);
    await ensureSampleProjectFiles(projectId);
    await set(refreshFileTreeAtom);
  },
);
