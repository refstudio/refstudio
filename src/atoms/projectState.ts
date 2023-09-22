import { Atom, atom } from 'jotai';

import { ProjectInfo } from '../api/projectsAPI';
import { ensureSampleProjectFiles, setCurrentFileSystemProjectId } from '../io/filesystem';
import { createModalAtoms } from './core/createModalAtoms';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { loadReferencesAtom } from './referencesState';
import { resetStateAtom } from './resetState';

// #####################################################################################
// Internal Atoms
// #####################################################################################
const currentProjectNameAtom = atom('');
const currentProjectIdAtom = atom('');

// #####################################################################################
// Public API
// #####################################################################################
export const isProjectOpenAtom = atom((get) => get(currentProjectIdAtom) !== '');
export const projectNameAtom: Atom<string> = currentProjectNameAtom;
export const projectIdAtom: Atom<string> = currentProjectIdAtom;

export const allProjectsAtom = atom<ProjectInfo[]>([]);

export const createProjectModalAtoms = createModalAtoms<string>();
export const selectProjectModalAtoms = createModalAtoms<string>();

export const openProjectAtom = atom(null, async (_, set, projectId: string, name: string) => {
  // Close current project before create new
  await set(closeProjectAtom);

  // Create empty project
  setCurrentFileSystemProjectId(projectId);
  set(currentProjectIdAtom, projectId);
  set(currentProjectNameAtom, name);

  await set(loadReferencesAtom, projectId);
  await set(refreshFileTreeAtom);
});

export const closeProjectAtom = atom(null, async (get, set) => {
  const isOpen = get(isProjectOpenAtom);
  if (isOpen) {
    setCurrentFileSystemProjectId('');
    set(currentProjectIdAtom, '');
    set(currentProjectNameAtom, '');

    await set(resetStateAtom);
  }
});

export const newSampleProjectAtom = atom(null, async (_, set, projectId: string, projectName: string) => {
  // Close current project before create new
  await set(closeProjectAtom);

  // Open sample project
  setCurrentFileSystemProjectId(projectId);
  set(currentProjectIdAtom, projectId);
  set(currentProjectNameAtom, projectName);
  await ensureSampleProjectFiles(projectId);
  await set(refreshFileTreeAtom);
});
