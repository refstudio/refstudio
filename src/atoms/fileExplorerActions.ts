import { atom } from 'jotai';

import { readAllProjectFiles } from '../io/filesystem';
import { fileExplorerEntriesAtom } from './core/fileExplorerEntry';

export const fileExplorerAtom = atom((get) => get(fileExplorerEntriesAtom));

export const refreshFileTreeAtom = atom(null, async (get, set) => {
  const projectFiles = await readAllProjectFiles();
  const fileExplorerEntries = get(fileExplorerEntriesAtom);
  set(fileExplorerEntries.childrenAtom, projectFiles);
});
