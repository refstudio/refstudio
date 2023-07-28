import { atom } from 'jotai';

import { openProject } from '../io/filesystem';
import { loadReferencesAtom } from './referencesState';

const currentProjectPathAtom = atom('');

export const isProjectOpenAtom = atom((get) => get(currentProjectPathAtom) !== '');

export const openProjectAtom = atom(null, async (_, set, path: string) => {
  if (!path) {
    return;
  }

  set(currentProjectPathAtom, path);
  await openProject(path);
  await set(loadReferencesAtom);
});

export const closeProjectAtom = atom(null, async (_, set) => {
  // TODO
});
