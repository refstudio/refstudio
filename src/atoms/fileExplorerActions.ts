import { atom, Getter } from 'jotai';

import { readAllProjectFiles } from '../io/filesystem';
import { fileExplorerEntriesAtom } from './core/fileExplorerEntry';
import { FileExplorerEntry } from './types/FileExplorerEntry';

export const fileExplorerAtom = atom((get) => get(fileExplorerEntriesAtom));

export const refreshFileTreeAtom = atom(null, async (get, set) => {
  const projectFiles = await readAllProjectFiles();
  const fileExplorerEntries = get(fileExplorerEntriesAtom);
  set(fileExplorerEntries.childrenAtom, projectFiles);
});

export const getFileExplorerEntryFromPathAtom = (filePath: string) =>
  atom((get) => getFileExplorerEntryFromPath(filePath, get));

function getFileExplorerEntryFromPath(
  path: string,
  get: Getter,
  fileExplorerEntry: FileExplorerEntry = get(fileExplorerAtom),
): FileExplorerEntry | null {
  if (fileExplorerEntry.path === path) {
    return fileExplorerEntry;
  }

  if (!fileExplorerEntry.isFolder) {
    return null;
  }

  const nextLevelEntry = get(fileExplorerEntry.childrenAtom).find((childEntry) => path.startsWith(childEntry.path));
  if (nextLevelEntry) {
    return getFileExplorerEntryFromPath(path, get, nextLevelEntry);
  }

  return null;
}
