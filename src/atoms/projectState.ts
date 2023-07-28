import { Atom, atom } from 'jotai';

import { getSeparator, openProject } from '../io/filesystem';
import { closeAllEditorsAtom } from './editorActions';
import { refreshFileTreeAtom } from './fileExplorerActions';
import { clearAllReferencesAtom, loadReferencesAtom } from './referencesState';

const currentProjectPathAtom = atom('');

export const isProjectOpenAtom = atom((get) => get(currentProjectPathAtom) !== '');
export const projectPathAtom: Atom<string> = currentProjectPathAtom;

export const projectNameAtom = atom((get) => {
  const projectPath = get(currentProjectPathAtom);
  const segments = projectPath.split(getSeparator());
  if (segments.length > 1) {
    return segments.pop()!.toUpperCase().replace(/-\./g, ' ');
  }
  return '';
});

export const openProjectAtom = atom(null, async (_, set, path: string) => {
  if (!path) {
    return;
  }

  set(currentProjectPathAtom, path);
  await openProject(path);
  await set(loadReferencesAtom);
});

export const closeProjectAtom = atom(null, async (_, set) => {
  set(closeAllEditorsAtom);
  set(clearAllReferencesAtom);
  set(currentProjectPathAtom, '');
  await set(refreshFileTreeAtom);
});
